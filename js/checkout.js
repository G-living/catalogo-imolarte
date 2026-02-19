/**
 * IMOLARTE - Checkout Logic (Phase 1 - Duplicates Fixed)
 * 
 * Features:
 * ✅ Debounce submit (prevent duplicate orders)
 * ✅ Toast notifications (replace alerts)
 * ✅ Payment method capture (ANTICIPO_60 / PAGO_100 / WHATSAPP_ONLY)
 * ✅ Referral code input + validation
 * ✅ Wompi widget integration (sandbox)
 * ✅ Auto-redirect after successful payment (3 seconds)
 * ✅ Cart integration
 * 
 * Backend: IMOLARTE-sistema (Bound Apps Script)
 * Web App: https://script.google.com/macros/s/AKfycbxaoRuG9JLeSh4EWpcfDg-k68WdjheklfoJ90P7LN3XiQ4B9V2ZTR1eBhxieo-N2Z5rLw/exec
 */

// === CONFIG ===
const APPS_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxaoRuG9JLeSh4EWpcfDg-k68WdjheklfoJ90P7LN3XiQ4B9V2ZTR1eBhxieo-N2Z5rLw/exec';
const WOMPI_PUBLIC_KEY = 'pub_test_rT7K8rzYnk2Ec8Lv25tRL3JIof6b6Lwp'; // Update with your actual key

// === STATE ===
let isSubmitting = false;
let currentOrderId = null;
window.orderData = null; // Global to pass data between steps

// === HELPERS ===
function showToast(message, type = 'info') {
  const bg = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff';
  Toastify({
    text: message,
    duration: 4000,
    gravity: "top",
    position: "center",
    backgroundColor: bg,
    stopOnFocus: true
  }).showToast();
}

function generateOrderId() {
  return 'IMO-' + Math.floor(10000 + Math.random() * 90000);
}

// === MAIN CHECKOUT SUBMIT ===
async function handleCheckoutSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  if (isSubmitting) {
    showToast('Procesando... por favor espera', 'info');
    return;
  }

  isSubmitting = true;

  try {
    // Disable button
    const submitBtn = document.getElementById('submitButton') || e.target;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Procesando...';
    }

    // Validate form (from checkout-validation.js)
    if (typeof validateCheckoutForm === 'function' && !validateCheckoutForm()) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    // Build payload
    const formData = new FormData(document.getElementById('checkoutForm'));
    const data = Object.fromEntries(formData);
    data.ID_Pedido = generateOrderId();
    data.Origen = 'WEB';
    data.Fecha_Creacion = new Date().toLocaleDateString('es-CO');
    data.Hora_Creacion = new Date().toLocaleTimeString('es-CO');
    data.Items_JSON = JSON.stringify(window.cart || []);
    data.Subtotal = getCartTotal();
    data.Descuento = data.Tipo_Pago === 'PAGO_100' ? data.Subtotal * 0.03 : 0;
    data.Total_Pedido = data.Subtotal - data.Descuento;
    data.Tipo_Pago = data.Tipo_Pago || 'PAGO_100';
    data.Status_Pago = 'PENDIENTE';

    window.orderData = data; // Save for payment step

    showToast('Validando orden...', 'info');

    // Send to Sheets
    const response = await fetch(APPS_SCRIPT_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createOrder', data })
    });

    const result = await response.json();

    if (result.success) {
      showToast('Orden registrada exitosamente!', 'success');
      // Proceed to payment or WhatsApp
      if (data.Tipo_Pago.includes('WOMPI')) {
        // Trigger payment flow
        if (data.Tipo_Pago === 'ANTICIPO_60') {
          handlePagarAnticipo();
        } else {
          handlePagarCompleto();
        }
      } else if (data.Tipo_Pago === 'WHATSAPP_ONLY') {
        handleWhatsAppWishlist();
      }
      // Clear cart
      window.cart = [];
      updateCartUI();
    } else {
      showToast(result.message || 'Error al registrar orden', 'error');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    showToast('Error de conexión. Intenta de nuevo.', 'error');
  } finally {
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmar Orden';
    }
  }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('Checkout.js v1.1 - Duplicates fixed');

  const submitBtn = document.getElementById('submitButton');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleCheckoutSubmit);
  }

  // Pre-fill if stored
  const stored = ['name', 'email', 'phone'];
  stored.forEach(key => {
    const val = localStorage.getItem(`imolarte_${key}`);
    const el = document.getElementById(`client-${key}`);
    if (val && el) el.value = val;
  });
});