// js/checkout.js – Checkout logic (explicit init export)

import { CONFIG } from './config.js';
import { showToast, showLoading, hideLoading } from './ui.js';
import { getCartTotal, clearCart } from './cart.js';

export function initCheckout() {
  const section = document.getElementById('checkoutSection');
  if (!section) {
    console.log('Checkout section not found – skipping init');
    return;
  }

  console.log('Checkout initialized');

  // Delivery toggle
  const deliveryBtns = section.querySelectorAll('.delivery-btn');
  deliveryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      deliveryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const addr = section.querySelector('#addressSection');
      addr.style.display = btn.id === 'deliveryDomicilio' ? 'block' : 'none';
    });
  });

  // Whatsapp wishlist
  const whatsappBtn = section.querySelector('#whatsappWishlist');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', handleWhatsappWishlist);
  }

  // Wompi main button
  const wompiBtn = section.querySelector('#wompiMainBtn');
  if (wompiBtn) {
    wompiBtn.addEventListener('click', () => {
      section.querySelector('#wompiSubsection').style.display = 'block';
    });
  }

  // Back from Wompi
  const backBtn = section.querySelector('#backToCheckout');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      section.querySelector('#wompiSubsection').style.display = 'none';
    });
  }

  // 60% & 100% buttons (placeholder – add Wompi widget later)
  const anticipoBtn = section.querySelector('#pagoAnticipo');
  const completoBtn = section.querySelector('#pagoCompleto');
  if (anticipoBtn) anticipoBtn.addEventListener('click', () => startWompiPayment('60% Anticipo'));
  if (completoBtn) completoBtn.addEventListener('click', () => startWompiPayment('100% Completo (3% off)'));
}

async function handleWhatsappWishlist(e) {
  e.preventDefault();
  const btn = e.target;
  showLoading(btn, 'Enviando...');

  try {
    // Validate (simplified)
    const required = ['firstName', 'lastName', 'email', 'phone', 'termsAccept', 'cesionAccept'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.type === 'checkbox' && !el.checked) valid = false;
      if (el && el.type !== 'checkbox' && !el.value.trim()) valid = false;
    });

    if (!valid) {
      showToast('Completa todos los campos y acepta términos', 'error');
      return;
    }

    // Build fixed resume
    const name = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const delivery = document.querySelector('.delivery-btn.active')?.textContent || 'Retiro en Almacén';
    const address = document.getElementById('address')?.value || '';
    const notes = document.getElementById('notas')?.value || '';

    let products = '';
    cart.forEach(item => {
      products += `- ${item.code} - ${item.description} - ${item.collection} - Cantidad: ${item.quantity} - Precio: ${formatPrice(item.price)}\n`;
    });

    const total = formatPrice(getCartTotal());

    const msg = encodeURIComponent(
      `Hola IMOLARTE,\n\n` +
      `Envío mi pedido como wishlist para coordinación (sin pago por ahora):\n\n` +
      `Datos Personales:\n` +
      `Nombre: ${name}\n` +
      `Email: ${email}\n` +
      `Teléfono: ${phone}\n\n` +
      `Entrega:\n${delivery}${address ? `\nDirección: ${address}\nNotas: ${notes}` : ''}\n\n` +
      `Productos:\n${products}\n` +
      `Total estimado: ${total}\n\n` +
      `Acepto T&C y Autorizo tratamiento de datos (Ley 1581)\n\n` +
      `Quiero ser contactado para recibir asesoría personalizada.\n\n` +
      `Gracias!`
    );

    // Log to Sheet
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createWishlist',
        data: {
          ID_Wishlist: 'WISH-' + Date.now().toString().slice(-8),
          Fecha_Envio: new Date().toISOString(),
          Nombre: name,
          Email: email,
          Telefono: phone,
          Entrega: delivery,
          Direccion: address,
          Notas: notes,
          Items_JSON: JSON.stringify(cart),
          Total_Estimado: getCartTotal(),
          Status: 'WISHLIST',
          Fecha_Contacto_Previsto: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
          Empleado_Asignado: 'Filippo',
          Notas_Followup: '',
          Fecha_Ultimo_Contacto: '',
          Resultado_Contacto: ''
        }
      })
    });

    showToast('Wishlist enviada – te contactaremos pronto', 'success');
    window.open(`https://wa.me/${CONFIG.WHATSAPP.BUSINESS_NUMBER}?text=${msg}`, '_blank');

  } catch (err) {
    console.error(err);
    showToast('Error al enviar', 'error');
  } finally {
    hideLoading(btn);
  }
}

function startWompiPayment(type) {
  showToast(`Procesando ${type}...`, 'info');
  // Placeholder – add real Wompi widget here later
}