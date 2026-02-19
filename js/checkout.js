// js/checkout.js – Checkout form, validation, Wompi subsection, Whatsapp wishlist

import { CONFIG } from './config.js';
import { showToast, showLoading, hideLoading } from './ui.js';
import { getCartTotal, clearCart } from './cart.js';

export function initCheckout() {
  const checkoutSection = document.getElementById('checkoutSection');
  if (!checkoutSection) return;

  // Delivery toggle
  const deliveryButtons = document.querySelectorAll('.delivery-btn');
  deliveryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      deliveryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const addressSection = document.getElementById('addressSection');
      addressSection.style.display = btn.id === 'deliveryDomicilio' ? 'block' : 'none';
    });
  });

  // Single Wompi button
  const wompiBtn = document.getElementById('wompiMainBtn');
  if (wompiBtn) {
    wompiBtn.addEventListener('click', () => {
      document.getElementById('wompiSubsection').style.display = 'block';
      checkoutSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Back from Wompi subsection
  const backBtn = document.getElementById('backToCheckout');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('wompiSubsection').style.display = 'none';
    });
  }

  // Whatsapp wishlist button
  const whatsappBtn = document.getElementById('whatsappWishlist');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', handleWhatsappWishlist);
  }

  // Wompi 60% & 100% buttons
  const anticipoBtn = document.getElementById('pagoAnticipo');
  const completoBtn = document.getElementById('pagoCompleto');
  if (anticipoBtn) anticipoBtn.addEventListener('click', () => startWompiPayment('ANTICIPO_60'));
  if (completoBtn) completoBtn.addEventListener('click', () => startWompiPayment('PAGO_100'));
}

// Whatsapp wishlist – fixed resume, auto-log, wa.me
async function handleWhatsappWishlist(e) {
  e.preventDefault();

  const btn = e.target;
  showLoading(btn, 'Enviando...');

  try {
    // Validate form
    const required = ['firstName', 'lastName', 'email', 'phone', 'termsAccept', 'cesionAccept'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.type === 'checkbox' && !el.checked) valid = false;
      if (el && el.type !== 'checkbox' && !el.value.trim()) valid = false;
    });

    if (!valid) {
      showToast('Completa todos los campos y acepta los términos', 'error');
      return;
    }

    // Build resume
    const name = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const delivery = document.querySelector('.delivery-btn.active')?.textContent || 'Retiro en Almacén';
    const address = document.getElementById('address')?.value || '';
    const notes = document.getElementById('notas')?.value || '';

    let productsText = '';
    cart.forEach(item => {
      productsText += `- ${item.code} - ${item.description} - ${item.collection} - Cantidad: ${item.quantity} - Precio: ${formatPrice(item.price)}\n`;
    });

    const total = formatPrice(getCartTotal());

    const message = encodeURIComponent(
      `Hola IMOLARTE,\n\n` +
      `Envío mi pedido como wishlist para coordinación (sin pago por ahora):\n\n` +
      `Datos Personales:\n` +
      `Nombre: ${name}\n` +
      `Email: ${email}\n` +
      `Teléfono: ${phone}\n\n` +
      `Entrega:\n` +
      `${delivery}\n` +
      (address ? `Dirección: ${address}\nNotas: ${notes}\n\n` : '\n') +
      `Productos:\n` +
      productsText +
      `\nTotal estimado: ${total}\n\n` +
      `Acepto T&C y Autorizo tratamiento de datos (Ley 1581)\n\n` +
      `Quiero ser contactado para recibir asesoría personalizada.\n\n` +
      `Gracias!`
    );

    // Auto-log to Sheet (WISHLIST with employee follow-up columns)
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
          Fecha_Contacto_Previsto: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          Empleado_Asignado: 'Filippo',
          Notas_Followup: '',
          Fecha_Ultimo_Contacto: '',
          Resultado_Contacto: ''
        }
      })
    });

    showToast('Wishlist enviada – te contactaremos pronto', 'success');

    // Open WhatsApp
    window.open(`https://wa.me/${CONFIG.WHATSAPP.BUSINESS_NUMBER}?text=${message}`, '_blank');

  } catch (err) {
    console.error('Whatsapp error:', err);
    showToast('Error al enviar wishlist', 'error');
  } finally {
    hideLoading(btn);
  }
}

// Placeholder for Wompi payment (expand later)
async function startWompiPayment(type) {
  showToast(`Procesando pago ${type === 'ANTICIPO_60' ? '60%' : '100%'}...`, 'info');
  // ... Wompi widget logic ...
}