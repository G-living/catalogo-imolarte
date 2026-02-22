// js/dono.js
// IMOLARTE - Funcionalidad DONO (Regalar Crédito) - CON CANTIDADES Y SUBTOTALES

import { CONFIG } from './config.js';
import { formatPrice, showToast, closeModal } from './ui.js';

// ============================================================================
// ESTADO GLOBAL
// ============================================================================

let donoQuantities = {
  50000: 0,
  100000: 0,
  150000: 0
};

const MAX_QUANTITY = 20;

// ============================================================================
// CONSTANTES
// ============================================================================

const DONO_AMOUNTS = [50000, 100000, 150000];
const DONO_PREFIX = CONFIG.DONO_PREFIX || 'DNO-';

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export function initDono() {
  console.log('🎁 initDono() llamado');
  
  // Bind botones de cantidad
  document.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.amount, -1));
  });
  
  document.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.amount, 1));
  });
  
  // Bind inputs de cantidad
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => handleQuantityChange(e.target));
  });
  
  // Bind botón checkout
  const checkoutBtn = document.getElementById('dono-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
  
  // Bind botón abrir modal
  const donoBtn = document.getElementById('dono-btn');
  if (donoBtn) {
    donoBtn.addEventListener('click', () => openDonoModal());
  }
  
  // Bind cerrar modal
  const closeBtns = document.querySelectorAll('.close-dono');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => closeModal('dono-modal'));
  });
  
  console.log('✅ initDono() completado');
}

function openDonoModal() {
  const modal = document.getElementById('dono-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    resetDonoForm();
  }
}

function updateQuantity(amount, delta) {
  const currentQty = donoQuantities[amount] || 0;
  const newQty = Math.max(0, Math.min(currentQty + delta, MAX_QUANTITY));
  
  donoQuantities[amount] = newQty;
  
  // Actualizar input
  const input = document.querySelector(`.qty-input[data-amount="${amount}"]`);
  if (input) {
    input.value = newQty;
  }
  
  updateSubtotal(amount, newQty);
  updateTotal();
  updateCheckoutButton();
}

function handleQuantityChange(input) {
  const amount = input.dataset.amount;
  let value = parseInt(input.value) || 0;
  value = Math.max(0, Math.min(value, MAX_QUANTITY));
  
  donoQuantities[amount] = value;
  input.value = value;
  
  updateSubtotal(amount, value);
  updateTotal();
  updateCheckoutButton();
}

function updateSubtotal(amount, quantity) {
  const subtotalEl = document.querySelector(`.subtotal-value[data-amount="${amount}"]`);
  if (subtotalEl) {
    const subtotal = amount * quantity;
    subtotalEl.textContent = formatPrice(subtotal);
  }
}

function updateTotal() {
  const totalEl = document.getElementById('dono-total-amount');
  if (!totalEl) return;
  
  let total = 0;
  DONO_AMOUNTS.forEach(amount => {
    total += amount * (donoQuantities[amount] || 0);
  });
  
  totalEl.textContent = formatPrice(total);
}

function updateCheckoutButton() {
  const checkoutBtn = document.getElementById('dono-checkout-btn');
  if (!checkoutBtn) return;
  
  const totalItems = Object.values(donoQuantities).reduce((sum, qty) => sum + qty, 0);
  
  if (totalItems > 0) {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = `Checkout DONO (${totalItems} voucher${totalItems > 1 ? 's' : ''})`;
  } else {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Checkout DONO';
  }
}

async function proceedToCheckout() {
  const totalItems = Object.values(donoQuantities).reduce((sum, qty) => sum + qty, 0);
  
  if (totalItems === 0) {
    showToast('⚠️ Selecciona al menos 1 voucher', 'error');
    return;
  }
  
  // Mostrar loading
  const loadingEl = document.getElementById('dono-loading');
  const checkoutBtn = document.getElementById('dono-checkout-btn');
  
  if (loadingEl) loadingEl.classList.remove('hidden');
  if (checkoutBtn) checkoutBtn.disabled = true;
  
  try {
    // Generar códigos para cada voucher
    const codes = [];
    DONO_AMOUNTS.forEach(amount => {
      const qty = donoQuantities[amount];
      if (qty > 0) {
        for (let i = 0; i < qty; i++) {
          codes.push({
            amount,
            code: generateUniqueDonoCode()
          });
        }
      }
    });
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mostrar resultado
    showDonoSuccess(codes);
    
    showToast(`✅ ${codes.length} código${codes.length > 1 ? 's' : ''} DONO generado${codes.length > 1 ? 's' : ''}`, 'success');
    
  } catch (error) {
    console.error('❌ Error en checkout DONO:', error);
    showToast('⚠️ Error procesando tu pedido. Intenta de nuevo.', 'error');
  } finally {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (checkoutBtn) checkoutBtn.disabled = false;
  }
}

function generateUniqueDonoCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${DONO_PREFIX}${timestamp}${random}`;
}

function showDonoSuccess(codes) {
  const modal = document.getElementById('dono-modal');
  if (!modal) return;
  
  // Agrupar códigos por monto
  const groupedCodes = {};
  codes.forEach(({ amount, code }) => {
    if (!groupedCodes[amount]) {
      groupedCodes[amount] = [];
    }
    groupedCodes[amount].push(code);
  });
  
  // Crear contenido de resultado
  let codesHTML = '';
  DONO_AMOUNTS.forEach(amount => {
    if (groupedCodes[amount]) {
      codesHTML += `
        <div class="dono-result-group">
          <h4>Voucher${groupedCodes[amount].length > 1 ? 's' : ''} $${formatPrice(amount)}:</h4>
          <ul class="dono-codes-list">
            ${groupedCodes[amount].map(code => `<li><code>${code}</code></li>`).join('')}
          </ul>
        </div>
      `;
    }
  });
  
  const totalAmount = codes.reduce((sum, { amount }) => sum + amount, 0);
  
  modal.querySelector('.modal-content').innerHTML = `
    <button class="close-modal close-dono" type="button" aria-label="Cerrar">&times;</button>
    <div class="success-icon">✅</div>
    <h2>¡Códigos DONO Generados!</h2>
    <p>Se han generado ${codes.length} código${codes.length > 1 ? 's' : ''> único${codes.length > 1 ? 's' : ''}.</p>
    
    <div class="dono-codes-container">
      ${codesHTML}
    </div>
    
    <div class="dono-total-final">
      <strong>Total pagado:</strong>
      <span>${formatPrice(totalAmount)}</span>
    </div>
    
    <div class="dono-actions">
      <button class="btn-secondary" id="copy-all-codes" type="button">
        📋 Copiar Todos los Códigos
      </button>
      <button class="btn-secondary" id="share-whatsapp" type="button">
        📱 Compartir por WhatsApp
      </button>
      <button class="btn-primary" id="close-success" type="button">
        ✓ Listo
      </button>
    </div>
  `;
  
  // Bind eventos
  const copyBtn = modal.querySelector('#copy-all-codes');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => copyAllCodes(codes));
  }
  
  const shareBtn = modal.querySelector('#share-whatsapp');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => shareWhatsApp(codes));
  }
  
  const closeBtn = modal.querySelector('#close-success');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal('dono-modal');
      resetDonoForm();
    });
  }
  
  const closeModals = modal.querySelectorAll('.close-dono');
  closeModals.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal('dono-modal');
      resetDonoForm();
    });
  });
}

function copyAllCodes(codes) {
  const text = codes.map(({ code, amount }) => `${code} - $${formatPrice(amount)}`).join('\n');
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Códigos copiados al portapapeles', 'success');
  }).catch(() => {
    showToast('⚠️ No se pudieron copiar los códigos', 'error');
  });
}

function shareWhatsApp(codes) {
  const text = `🎁 ¡Te regalo crédito para IMOLARTE!\n\n` +
    codes.map(({ code, amount }) => `• ${code} - $${formatPrice(amount)}`).join('\n') +
    `\n\nÚsalos en tu compra de cerámicas italianas exclusivas.\n` +
    `🛒 ${CONFIG.BASE_URL}/`;
  
  const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function resetDonoForm() {
  donoQuantities = { 50000: 0, 100000: 0, 150000: 0 };
  
  document.querySelectorAll('.qty-input').forEach(input => {
    input.value = '0';
  });
  
  DONO_AMOUNTS.forEach(amount => {
    updateSubtotal(amount, 0);
  });
  
  updateTotal();
  updateCheckoutButton();
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', initDono);