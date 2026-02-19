// js/dono.js – Dono mode logic (modal, code gen, share)

import { CONFIG } from './config.js';
import { showToast, createModal, formatPrice } from './ui.js';
import { addToCart } from './cart.js';

// Open Dono modal
export function openDonoModal() {
  const modal = createModal('Regala Crédito Exclusivo', `
    <label style="display:block; margin:16px 0 8px; font-weight:bold;">Monto del Dono</label>
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
      ${CONFIG.DONO.PRESETS.map(amt => `
        <button type="button" class="dono-preset" data-amount="${amt}" style="
          padding:12px 20px; border:2px solid #b8975e; border-radius:8px; background:none;
          cursor:pointer; font-weight:bold;
        ">${formatPrice(amt)}</button>
      `).join('')}
    </div>
    <input type="number" id="dono-custom-amount" placeholder="Otro monto (mín. ${formatPrice(CONFIG.DONO.MIN_AMOUNT)})" min="${CONFIG.DONO.MIN_AMOUNT}" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:8px; margin-bottom:24px;">

    <label style="display:block; margin:16px 0 8px; font-weight:bold;">Para quién es el regalo</label>
    <input type="text" id="dono-recipient-name" placeholder="Nombre del destinatario" required style="width:100%; padding:12px; border:1px solid #ccc; border-radius:8px; margin-bottom:12px;">
    <input type="email" id="dono-recipient-email" placeholder="Email (opcional)" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:8px; margin-bottom:12px;">
    <input type="tel" id="dono-recipient-phone" placeholder="WhatsApp (opcional)" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:8px; margin-bottom:24px;">

    <button id="add-dono-to-cart" style="width:100%; padding:16px; background:#b8975e; color:white; border:none; border-radius:12px; font-size:1.3rem; cursor:pointer;">
      Agregar al Carrito y Generar Código
    </button>
  `);

  modal.querySelectorAll('.dono-preset').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('dono-custom-amount').value = btn.dataset.amount;
      modal.querySelectorAll('.dono-preset').forEach(b => b.style.background = 'none');
      btn.style.background = '#b8975e33';
    };
  });

  modal.querySelector('#add-dono-to-cart').onclick = () => addDonoToCart(modal);
}

// Add Dono to cart & log
async function addDonoToCart(modal) {
  const amount = Number(document.getElementById('dono-custom-amount').value);
  if (isNaN(amount) || amount < CONFIG.DONO.MIN_AMOUNT || amount > CONFIG.DONO.MAX_AMOUNT) {
    showToast('Monto inválido', 'error');
    return;
  }

  const name = document.getElementById('dono-recipient-name').value.trim();
  if (!name) {
    showToast('Ingresa el nombre del destinatario', 'error');
    return;
  }

  // Generate code
  const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let donoCode = CONFIG.DONO.CODE_PREFIX;
  for (let i = 0; i < CONFIG.DONO.CODE_LENGTH; i++) {
    donoCode += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
  }

  // Expiration
  const purchaseDate = new Date();
  const expirationDate = new Date(purchaseDate);
  expirationDate.setDate(expirationDate.getDate() + CONFIG.DONO.EXPIRATION_DAYS);

  // Add to cart
  addToCart({
    description: `Crédito Dono - ${formatPrice(amount)}`,
    collection: 'Dono Exclusivo',
    code: donoCode,
    price: amount,
    quantity: 1
  });

  // Log to DONOS sheet
  try {
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createDono',
        donoCode,
        purchaseDate: purchaseDate.toISOString(),
        expirationDate: expirationDate.toISOString(),
        issuedAmount: amount,
        issuerClientId: 'GUEST_' + Date.now(),
        recipientName: name,
        recipientEmail: document.getElementById('dono-recipient-email').value.trim(),
        recipientPhone: document.getElementById('dono-recipient-phone').value.trim(),
        status: 'ACTIVE',
        usedAmount: 0,
        lastUsedDate: '',
        redeemedInOrderId: ''
      })
    });
    showToast(`¡Dono creado! Código: ${donoCode}`, 'success');
  } catch (err) {
    showToast('Dono agregado, pero error al guardar', 'warning');
  }

  // WhatsApp share
  const msg = encodeURIComponent(
    `¡Te regalo un crédito exclusivo en IMOLARTE! 🎁\n` +
    `Código: ${donoCode}\n` +
    `Valor: ${formatPrice(amount)}\n` +
    `Válido hasta ${expirationDate.toLocaleDateString('es-CO')}\n` +
    `Úsalo en: https://g-living.github.io/catalogo-imolarte/?dono=${donoCode}\n` +
    `¡Un abrazo fuerte!`
  );

  window.open(`https://wa.me/${CONFIG.WHATSAPP.BUSINESS_NUMBER}?text=${msg}`, '_blank');

  modal.remove();
}