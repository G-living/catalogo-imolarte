// js/checkout/checkout-dono.js
// IMOLARTE - Checkout para Generar Código DONO (20-30% específico)

import { CONFIG } from '../config.js';
import { formatPrice, showToast } from '../ui.js';
import { initCheckoutBase, showCheckoutSuccess, clearCheckoutSession } from './checkout-base.js';
import { generateUniqueDonoCode } from '../dono.js';

// ============================================================================
// ESTADO ESPECÍFICO DE DONO
// ============================================================================

let donoSession = {
  amount: 0,
  code: null,
  expiryDate: null
};

// ============================================================================
// FUNCIONES ESPECÍFICAS DE DONO
// ============================================================================

/**
 * Obtiene items del DONO (específico de checkout-dono)
 * @returns {Array} Items del DONO (solo 1 item virtual)
 */
function getDonoItems() {
  if (!donoSession.amount || donoSession.amount <= 0) {
    return [];
  }
  
  return [{
    sku: 'DONO-VIRTUAL',
    descripcion: 'Código DONO - Crédito Regalable',
    coleccion: 'DONO',
    cantidad: 1,
    precio: donoSession.amount
  }];
}

/**
 * Genera código DONO único (específico de checkout-dono)
 * @param {Object} checkoutData - Datos del checkout
 * @returns {Promise<Object>} Resultado de generación
 */
async function generateDono(checkoutData) {
  try {
    const code = generateUniqueDonoCode();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONFIG.DONO_VALIDITY_DAYS);
    
    donoSession = {
      amount: checkoutData.total,
      code,
      expiryDate
    };
    
    return {
      success: true,
      code,
      amount: checkoutData.total,
      expiryDate: expiryDate.toISOString()
    };
  } catch (error) {
    console.error('❌ Error generando DONO:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Callback post-checkout exitoso (específico de checkout-dono)
 * @param {Object} checkoutData - Datos del checkout
 * @param {Object} order - Datos del pedido
 */
async function onDonoSuccess(checkoutData, order) {
  const donoResult = await generateDono(checkoutData);
  
  if (donoResult.success) {
    clearCheckoutSession();
    showDonoSuccess(donoResult);
  } else {
    throw new Error(donoResult.message || 'Error generando código DONO');
  }
}

/**
 * Muestra éxito de generación DONO (específico de checkout-dono)
 * @param {Object} donoData - Datos del DONO generado
 */
function showDonoSuccess(donoData) {
  const checkoutSection = document.getElementById('checkout-section');
  if (checkoutSection) checkoutSection.classList.add('hidden');
  
  const donoResultEl = document.getElementById('dono-result');
  if (donoResultEl) {
    const codeValueEl = document.getElementById('dono-code-value');
    const amountValueEl = document.getElementById('dono-amount-value');
    const expiryDateEl = document.getElementById('dono-expiry-date');
    
    if (codeValueEl) codeValueEl.textContent = donoData.code;
    if (amountValueEl) amountValueEl.textContent = formatPrice(donoData.amount);
    if (expiryDateEl) {
      expiryDateEl.textContent = new Date(donoData.expiryDate).toLocaleDateString('es-CO');
    }
    
    donoResultEl.classList.remove('hidden');
    
    const formElements = document.querySelectorAll('.dono-amounts, .dono-custom-amount, #generate-dono-btn');
    formElements.forEach(el => el.classList.add('hidden'));
    
    showToast('✅ Código DONO generado exitosamente', 'success');
  }
}

/**
 * Inicializa checkout para DONO
 */
export function initDonoCheckout() {
  console.log('🎁 initDonoCheckout() llamado');
  initCheckoutBase(getDonoItems, onDonoSuccess);
  console.log('✅ initDonoCheckout() completado');
}

/**
 * Valida monto DONO antes de checkout
 * @param {number} amount - Monto a validar
 * @returns {boolean} Si el monto es válido
 */
export function validateDonoAmount(amount) {
  if (!amount || amount < CONFIG.MIN_DONO_AMOUNT) {
    showToast(`⚠️ El monto mínimo es ${formatPrice(CONFIG.MIN_DONO_AMOUNT)}`, 'error');
    return false;
  }
  
  if (amount > CONFIG.MAX_DONO_AMOUNT) {
    showToast(`⚠️ El monto máximo es ${formatPrice(CONFIG.MAX_DONO_AMOUNT)}`, 'error');
    return false;
  }
  
  return true;
}

/**
 * Establece monto de DONO
 * @param {number} amount - Monto en COP
 */
export function setDonoAmount(amount) {
  if (validateDonoAmount(amount)) {
    donoSession.amount = amount;
    return true;
  }
  return false;
}

/**
 * Obtiene monto actual de DONO
 * @returns {number} Monto en COP
 */
export function getDonoAmount() {
  return donoSession.amount;
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDonoCheckout);
} else {
  initDonoCheckout();
}