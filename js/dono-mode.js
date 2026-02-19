/**
 * IMOLARTE - Dono Mode (Gift Credit) - Complete Flow
 * 
 * Features:
 * - Button injected below logo + first row of products
 * - Modal: select amount (presets + custom), add recipient info
 * - Add to cart as special "Dono Credit" item
 * - Generate unique 10-digit code (DONO-XXXXXXXXXX)
 * - Log to DONOS sheet with 1-year expiration
 * - WhatsApp share with pre-filled gift message
 * 
 * Integration: cart.js, checkout.js, code.gs (Apps Script)
 */

const DONO_CONFIG = {
  minAmount: 50000,
  maxAmount: 5000000,
  presets: [50000, 100000, 200000, 500000, 1000000],
  defaultAmount: 200000,
  codePrefix: 'DONO-',
  codeLength: 10,
  expirationDays: 365,
  whatsappNumber: '573004257367', // Update if needed
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbxaoRuG9JLeSh4EWpcfDg-k68WdjheklfoJ90P7LN3XiQ4B9V2ZTR1eBhxieo-N2Z5rLw/exec'
};

// === INJECT DONO BUTTON ON INDEX.HTML ===
function injectDonoButton() {
  const header = document.querySelector('header') || document.body;
  const firstRow = document.querySelector('.catalog-row') || document.querySelector('.products-grid');

  if (document.getElementById('dono-mode-btn')) return; // Prevent double injection

  const btn = document.createElement('button');
  btn.id = 'dono-mode-btn';
  btn.innerHTML = '🎁 Modo Dono - Regala Crédito Exclusivo';
  btn.style.cssText = `
    margin: 20px auto;
    padding: 16px 32px;
    font-size: 1.3rem;
    font-weight: bold;
    background: linear-gradient(135deg, #c9a96e, #b8975e);
    color: #1a1a1a;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    display: block;
  `;
  btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';
  btn.onclick = openDonoModal;

  // Insert position: below logo + before first product row
  if (header && firstRow) {
    header.parentNode.insertBefore(btn, firstRow);
  } else {
    document.body.prepend(btn);
  }

  console.log('🎁 Dono Mode button injected');
}

// === MODAL & FLOW ===
function openDonoModal() {
  const modal = document.createElement('div');
  modal.id = 'dono-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center; z-index: 9999;
  `;

  modal.innerHTML = `
    <div style="
      background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3); position: relative; overflow: hidden;
    ">
      <button onclick="this.closest('#dono-modal').remove()" style="
        position: absolute; top: 16px; right: 16px; background: none; border: none;
        font-size: 28px; cursor: pointer; color: #666;
      ">×</button>

      <h2 style="text-align:center; color:#b8975e; margin-bottom:24px;">Regala Crédito Exclusivo</h2>

      <label style="display:block; margin:16px 0 8px; font-weight:bold;">Monto del Dono</label>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px;">
        ${DONO_CONFIG.presets.map(amt => `
          <button type="button" class="dono-preset" data-amount="${amt}" style="
            padding:12px 20px; border:2px solid #b8975e; border-radius:8px; background:none;
            cursor:pointer; font-weight:bold;
          ">${formatPrice(amt)}</button>
        `).join('')}
      </div>
      <input type="number" id="dono-custom-amount" placeholder="Otro monto (mín. $50.000)" min="${DONO_CONFIG.minAmount}" style="
        width:100%; padding:12px; font-size:1.1rem; border:1px solid #ccc; border-radius:8px; margin-bottom:24px;
      ">

      <label style="display:block; margin:16px 0 8px; font-weight:bold;">Para quién es el regalo</label>
      <input type="text" id="dono-recipient-name" placeholder="Nombre del destinatario" style="width:100%; padding:12px; margin-bottom:12px; border:1px solid #ccc; border-radius:8px;">
      <input type="email" id="dono-recipient-email" placeholder="Email (opcional)" style="width:100%; padding:12px; margin-bottom:12px; border:1px solid #ccc; border-radius:8px;">
      <input type="tel" id="dono-recipient-phone" placeholder="WhatsApp (opcional)" style="width:100%; padding:12px; margin-bottom:24px; border:1px solid #ccc; border-radius:8px;">

      <button id="add-dono-to-cart" style="
        width:100%; padding:16px; background:#b8975e; color:white; border:none;
        border-radius:12px; font-size:1.3rem; font-weight:bold; cursor:pointer;
      ">Agregar al Carrito y Generar Código</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Preset buttons
  modal.querySelectorAll('.dono-preset').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('dono-custom-amount').value = btn.dataset.amount;
      modal.querySelectorAll('.dono-preset').forEach(b => b.style.background = 'none');
      btn.style.background = '#b8975e33';
    };
  });

  // Add to cart button
  document.getElementById('add-dono-to-cart').onclick = () => addDonoToCart(modal);
}

// === ADD DONO TO CART & GENERATE CODE ===
async function addDonoToCart(modal) {
  const amountInput = document.getElementById('dono-custom-amount');
  const amount = Number(amountInput.value);

  if (isNaN(amount) || amount < DONO_CONFIG.minAmount || amount > DONO_CONFIG.maxAmount) {
    showToast(`Monto inválido (entre ${formatPrice(DONO_CONFIG.minAmount)} y ${formatPrice(DONO_CONFIG.maxAmount)})`, 'error');
    return;
  }

  const recipientName = document.getElementById('dono-recipient-name').value.trim();
  if (!recipientName) {
    showToast('Por favor ingresa el nombre del destinatario', 'error');
    return;
  }

  // Generate unique 10-digit code
  const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let donoCode = DONO_CONFIG.codePrefix;
  for (let i = 0; i < DONO_CONFIG.codeLength; i++) {
    donoCode += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
  }

  // Expiration
  const purchaseDate = new Date();
  const expirationDate = new Date(purchaseDate);
  expirationDate.setDate(expirationDate.getDate() + DONO_CONFIG.expirationDays);

  // Add to cart as special item
  addToCart(
    `Crédito Dono - ${formatPrice(amount)}`,
    'Dono Exclusivo',
    donoCode,
    amount,
    1
  );

  // Log to DONOS sheet
  try {
    await fetch(DONO_CONFIG.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createDono',
        donoCode,
        purchaseDate: purchaseDate.toISOString(),
        expirationDate: expirationDate.toISOString(),
        issuedAmount: amount,
        issuerClientId: 'GUEST_' + Date.now(), // or real client ID if logged in
        recipientName,
        recipientEmail: document.getElementById('dono-recipient-email').value.trim(),
        recipientPhone: document.getElementById('dono-recipient-phone').value.trim(),
        status: 'ACTIVE',
        usedAmount: 0,
        lastUsedDate: '',
        redeemedInOrderId: ''
      })
    });
    showToast('¡Dono creado! Código: ' + donoCode, 'success');
  } catch (err) {
    console.error('Dono log error:', err);
    showToast('Dono agregado al carrito, pero error al guardar (no crítico)', 'warning');
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

  window.open(`https://wa.me/${DONO_CONFIG.whatsappNumber}?text=${msg}`, '_blank');

  modal.remove();
}

// === UTILS ===
function formatPrice(num) {
  return '$' + Number(num).toLocaleString('es-CO');
}

function showToast(message, type = 'info') {
  const bg = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff';
  Toastify({
    text: message,
    duration: 5000,
    gravity: "top",
    position: "center",
    backgroundColor: bg,
    stopOnFocus: true
  }).showToast();
}

// Auto-inject on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectDonoButton);
} else {
  injectDonoButton();
}