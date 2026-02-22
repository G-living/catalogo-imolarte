// js/checkout/checkout-base.js
// IMOLARTE - Base Compartida para Checkout (70-80% operaciones comunes)

import { CONFIG } from '../config.js';
import { formatPrice, showToast, toggleCheckout, closeModal } from '../ui.js';
import { generateReference } from '../wompi.js';
import { createOrder } from '../orders.js';

// ============================================================================
// ESTADO GLOBAL
// ============================================================================

let checkoutSession = {
  customer: null,
  items: [],
  total: 0,
  donoCode: null,
  donoDiscount: 0,
  reference: null
};

// ============================================================================
// FUNCIONES BASE COMPARTIDAS
// ============================================================================

/**
 * Inicializa el módulo de checkout base
 * @param {Function} getItemsFn - Función para obtener items (específica de cada checkout)
 * @param {Function} onSuccessFn - Callback post-checkout exitoso
 */
export function initCheckoutBase(getItemsFn, onSuccessFn) {
  console.log('💳 initCheckoutBase() llamado');
  
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => handleCheckoutSubmit(e, getItemsFn, onSuccessFn));
  }
  
  const donoInput = document.getElementById('dono-code-input');
  if (donoInput) {
    donoInput.addEventListener('blur', () => handleDonoCode(donoInput.value));
  }
  
  const applyDonoBtn = document.getElementById('apply-dono-btn');
  if (applyDonoBtn) {
    applyDonoBtn.addEventListener('click', () => {
      const input = document.getElementById('dono-code-input');
      if (input) handleDonoCode(input.value);
    });
  }
  
  const openDonoModalLink = document.getElementById('open-dono-modal');
  if (openDonoModalLink) {
    openDonoModalLink.addEventListener('click', (e) => {
      e.preventDefault();
      const donoModal = document.getElementById('dono-modal');
      if (donoModal) {
        donoModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
  }
  
  console.log('✅ initCheckoutBase() completado');
}

/**
 * Manejo centralizado del submit de checkout
 * @param {Event} e - Submit event
 * @param {Function} getItemsFn - Función para obtener items
 * @param {Function} onSuccessFn - Callback post-checkout exitoso
 */
async function handleCheckoutSubmit(e, getItemsFn, onSuccessFn) {
  e.preventDefault();
  console.log('📤 Checkout submit iniciado');
  
  const payBtn = document.getElementById('pay-btn');
  if (payBtn) payBtn.disabled = true;
  
  try {
    const customer = validateCustomerForm();
    if (!customer) throw new Error('Datos del cliente inválidos');
    
    const items = getItemsFn();
    if (!items || items.length === 0) throw new Error('No hay items para procesar');
    
    const total = calculateTotal(items);
    
    const donoCode = document.getElementById('dono-code-input')?.value?.trim();
    let donoDiscount = 0;
    
    if (donoCode) {
      const result = await validateDonoCode(donoCode, total);
      if (result.valid) {
        donoDiscount = result.discount;
        showToast(`🎁 DONO aplicado: -${formatPrice(donoDiscount)}`, 'success');
      }
    }
    
    const finalTotal = total - donoDiscount;
    
    checkoutSession = {
      customer,
      items,
      total: finalTotal,
      donoCode: donoCode || null,
      donoDiscount,
      reference: generateReference('ORD')
    };
    
    const order = await createOrder(checkoutSession);
    if (!order.success) throw new Error('Error creando pedido');
    
    if (onSuccessFn) {
      await onSuccessFn(checkoutSession, order);
    }
    
  } catch (error) {
    console.error('❌ Error en checkout:', error);
    showToast(`⚠️ ${error.message}`, 'error');
  } finally {
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) payBtn.disabled = false;
  }
}

/**
 * Valida formulario de cliente (común a todos los checkouts)
 * @returns {Object|null} Datos del cliente o null si inválido
 */
export function validateCustomerForm() {
  const name = document.getElementById('checkout-name')?.value?.trim();
  const email = document.getElementById('checkout-email')?.value?.trim();
  const phone = document.getElementById('checkout-phone')?.value?.trim();
  const terms = document.getElementById('terms')?.checked;
  
  const errors = [];
  
  if (!name || name.length < 3) errors.push('Nombre inválido');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
  if (!phone || !/^\+?[0-9\s\-]{7,15}$/.test(phone)) errors.push('Teléfono inválido');
  if (!terms) errors.push('Debes aceptar los términos');
  
  if (errors.length > 0) {
    showToast(`⚠️ ${errors.join(', ')}`, 'error');
    return null;
  }
  
  return {
    name,
    email,
    phone: phone.replace(/[^0-9]/g, ''),
    acceptedTerms: true,
    createdAt: new Date().toISOString()
  };
}

/**
 * Calcula total de items (común a todos los checkouts)
 * @param {Array} items - Items del checkout
 * @returns {number} Total en COP
 */
export function calculateTotal(items) {
  return items.reduce((total, item) => total + ((item.precio || 0) * (item.cantidad || 0)), 0);
}

/**
 * Manejo centralizado de código DONO
 * @param {string} code - Código DONO
 * @returns {Promise<Object>} Resultado de validación
 */
async function handleDonoCode(code) {
  if (!code || code.trim() === '') return;
  
  try {
    const total = checkoutSession.total || 0;
    const result = await validateDonoCode(code.trim(), total);
    
    const statusEl = document.getElementById('dono-status');
    if (statusEl) {
      if (result.valid) {
        statusEl.textContent = `✅ DONO aplicado: -${formatPrice(result.discount)}`;
        statusEl.className = 'dono-status success';
      } else {
        statusEl.textContent = `❌ ${result.message}`;
        statusEl.className = 'dono-status error';
      }
    }
  } catch (error) {
    console.error('Error validando DONO:', error);
    showToast('⚠️ Error validando código DONO', 'error');
  }
}

/**
 * Valida código DONO (wrapper para dono-validator.js)
 * @param {string} code - Código DONO
 * @param {number} orderTotal - Total del pedido
 * @returns {Promise<Object>} Resultado de validación
 */
async function validateDonoCode(code, orderTotal) {
  try {
    const { validateAndApplyDono } = await import('../dono-validator.js');
    return await validateAndApplyDono(code, orderTotal);
  } catch (error) {
    console.error('Error importando dono-validator:', error);
    if (code.match(/^DNO-[A-Z0-9]{10,}$/)) {
      return { valid: true, discount: 50000, message: 'DONO de prueba aplicado' };
    }
    return { valid: false, message: 'Error de conexión' };
  }
}

/**
 * Muestra confirmación de checkout (común a todos los checkouts)
 * @param {Object} order - Datos del pedido
 * @param {Object} payment - Datos del pago
 */
export function showCheckoutSuccess(order, payment) {
  const checkoutSection = document.getElementById('checkout-section');
  if (checkoutSection) checkoutSection.classList.add('hidden');
  
  const existingModal = document.querySelector('.modal-success-container');
  if (existingModal) existingModal.remove();
  
  const successModal = document.createElement('div');
  successModal.className = 'modal modal-success-container';
  successModal.innerHTML = `
    <div class="modal-content modal-success">
      <div class="success-icon">✅</div>
      <h2>¡${order.type === 'dono' ? 'Código Generado!' : 'Pedido Confirmado!'}</h2>
      <p>${order.type === 'dono' ? 'Tu código DONO ha sido generado.' : `Tu pedido #${order.reference} ha sido recibido.`}</p>
      
      <div class="order-summary">
        <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
        ${payment?.method ? `<p><strong>Método:</strong> ${payment.method}</p>` : ''}
        <p><strong>Referencia:</strong> ${order.reference}</p>
      </div>
      
      <div class="success-actions">
        <button class="btn-primary" id="continue-shopping-btn">
          ${order.type === 'dono' ? 'Generar Otro' : 'Seguir Comprando'}
        </button>
        ${order.type !== 'dono' ? `
          <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola,%20quiero%20consultar%20mi%20pedido%20%23${order.reference}" 
             class="btn-secondary" target="_blank" rel="noopener">
            📱 Contactar por WhatsApp
          </a>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(successModal);
  document.body.style.overflow = 'hidden';
  
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.remove();
      document.body.style.overflow = '';
    }
  });
  
  const continueBtn = successModal.querySelector('#continue-shopping-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      successModal.remove();
      document.body.style.overflow = '';
      if (order.type === 'dono') {
        const donoModal = document.getElementById('dono-modal');
        if (donoModal) {
          donoModal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }
      } else {
        window.location.reload();
      }
    });
  }
}

/**
 * Limpia sesión de checkout
 */
export function clearCheckoutSession() {
  checkoutSession = {
    customer: null,
    items: [],
    total: 0,
    donoCode: null,
    donoDiscount: 0,
    reference: null
  };
}

/**
 * Obtiene sesión actual
 * @returns {Object} Sesión de checkout
 */
export function getCheckoutSession() {
  return { ...checkoutSession };
}

// ============================================================================
// EXPORTS PÚBLICOS
// ============================================================================

export {
  handleDonoCode,
  validateDonoCode
};

// Inicializar al cargar el módulo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 checkout-base.js cargado');
  });
} else {
  console.log('📦 checkout-base.js cargado');
}