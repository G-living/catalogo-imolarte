// js/checkout.js – Checkout form, validation, submission, payment trigger

import { CONFIG } from './config.js';
import { showToast, showLoading, hideLoading } from './ui.js';
import { getCartTotal, clearCart } from './cart.js';

/**
 * Initialize checkout page (form validation, submit, dono redemption, payment)
 */
export function initCheckout() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  // Dono code field (add this HTML to your checkout form if not already)
  // <input type="text" id="donoCode" placeholder="Código Dono (opcional)">
  const donoInput = document.getElementById('donoCode');
  if (donoInput) {
    donoInput.addEventListener('input', async () => {
      const code = donoInput.value.trim();
      if (code.length < 10) return;

      const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validateDonoCode', code })
      });

      const result = await response.json();
      if (result.valid) {
        showToast(`Código válido: ${formatPrice(result.remaining)} disponible`, 'success');
        // Store for later use in payment
        window.donoCredit = result.remaining;
      } else {
        showToast('Código inválido o expirado', 'error');
        window.donoCredit = 0;
      }
    });
  }

  // Submit handler (replace your old submit button onclick)
  const submitBtn = document.getElementById('submitButton');
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleCheckoutSubmit(e);
    });
  }
}

// === MAIN SUBMIT LOGIC ===
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const submitBtn = e.target;
  showLoading(submitBtn, 'Procesando...');

  try {
    // Validate form (simple built-in, expand later)
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
    for (const id of requiredFields) {
      const field = document.getElementById(id);
      if (field && !field.value.trim()) {
        showToast('Completa todos los campos obligatorios', 'error');
        return;
      }
    }

    // Build payload
    const data = {
      ID_Pedido: 'IMO-' + Date.now().toString().slice(-5),
      Cliente_ID: 'CLI-' + Date.now().toString().slice(-5), // Later: real ID
      Nombre_Cliente: document.getElementById('firstName')?.value || '',
      Apellido_Cliente: document.getElementById('lastName')?.value || '',
      Email_Cliente: document.getElementById('email')?.value || '',
      Telefono_Cliente: document.getElementById('phone')?.value || '',
      Direccion_Entrega: document.getElementById('address')?.value || '',
      Ciudad_Entrega: document.getElementById('city')?.value || '',
      Items_JSON: JSON.stringify(cart),
      Subtotal: getCartTotal(),
      Descuento: 0, // Later: referral or dono discount
      Total_Pedido: getCartTotal(),
      Tipo_Pago: 'PAGO_100', // Later: from radio buttons
      Status_Pago: 'PENDIENTE'
    };

    // Apply dono credit if valid
    if (window.donoCredit > 0) {
      const discount = Math.min(window.donoCredit, data.Total_Pedido);
      data.Descuento += discount;
      data.Total_Pedido -= discount;
      data.Dono_Code = document.getElementById('donoCode')?.value.trim();
      showToast(`Crédito Dono aplicado: ${formatPrice(discount)}`, 'success');
    }

    // Send to Sheets
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createOrder', data })
    });

    const result = await response.json();

    if (result.success) {
      showToast('Orden registrada exitosamente!', 'success');
      clearCart();

      if (data.Total_Pedido > 0) {
        // Trigger Wompi payment
        await startWompiPayment(data);
      } else {
        showToast('¡Pago completado con crédito Dono! Gracias.', 'success');
        setTimeout(() => window.location.href = 'index.html', 3000);
      }
    } else {
      showToast(result.message || 'Error al registrar orden', 'error');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    showToast('Error de conexión. Intenta de nuevo.', 'error');
  } finally {
    hideLoading(submitBtn);
  }
}

// === WOMPI PAYMENT STARTER ===
async function startWompiPayment(orderData) {
  try {
    showToast('Solicitando firma de pago...', 'info');

    const sigResponse = await fetch(CONFIG.WOMPI_SIGNATURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: orderData.ID_Pedido,
        amountInCents: Math.round(orderData.Total_Pedido * 100),
        currency: CONFIG.CURRENCY
      })
    });

    const sigData = await sigResponse.json();

    if (!sigData.integritySignature) {
      throw new Error('No se pudo obtener la firma');
    }

    const checkout = new WidgetCheckout({
      publicKey: CONFIG.WOMPI_PUBLIC_KEY,
      reference: orderData.ID_Pedido,
      amountInCents: Math.round(orderData.Total_Pedido * 100),
      currency: CONFIG.CURRENCY,
      signature: { integrity: sigData.integritySignature },
      // Add more Wompi params as needed
    });

    checkout.open();

    // Listen for close event (success or cancel)
    window.addEventListener('wompi-widget-closed', (e) => {
      if (e.detail?.transaction?.status === 'APPROVED') {
        showToast('¡Pago exitoso! Redirigiendo...', 'success');
        setTimeout(() => window.location.href = 'index.html', 3000);
      } else {
        showToast('Transacción no completada', 'warning');
      }
    });
  } catch (err) {
    console.error('Wompi error:', err);
    showToast('Error al procesar pago con Wompi', 'error');
  }
}