// js/checkout/checkout-cart.js
// IMOLARTE - Checkout para Carrito de Compras (20-30% específico)

import { CONFIG } from '../config.js';
import { formatPrice, showToast } from '../ui.js';
import { getCart, getCartTotal, clearCart } from '../cart.js';
import { processWompiPayment } from '../wompi.js';
import { initCheckoutBase, showCheckoutSuccess, clearCheckoutSession } from './checkout-base.js';

// ============================================================================
// FUNCIONES ESPECÍFICAS DE CARRITO
// ============================================================================

/**
 * Obtiene items del carrito (específico de checkout-cart)
 * @returns {Array} Items del carrito
 */
function getCartItems() {
  const cart = getCart();
  return cart.filter(item => item && item.sku && item.cantidad > 0 && item.precio > 0);
}

/**
 * Procesa pago con Wompi (específico de checkout-cart)
 * @param {Object} checkoutData - Datos del checkout
 * @returns {Promise<Object>} Resultado del pago
 */
async function processPayment(checkoutData) {
  try {
    const paymentResult = await processWompiPayment({
      ...checkoutData,
      orderId: checkoutData.reference,
      reference: checkoutData.reference
    });
    
    return paymentResult;
  } catch (error) {
    console.error('❌ Error procesando pago:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Callback post-checkout exitoso (específico de checkout-cart)
 * @param {Object} checkoutData - Datos del checkout
 * @param {Object} order - Datos del pedido
 */
async function onCheckoutSuccess(checkoutData, order) {
  const paymentResult = await processPayment(checkoutData);
  
  if (paymentResult.success) {
    clearCart();
    clearCheckoutSession();
    showCheckoutSuccess({ ...order, type: 'cart' }, paymentResult);
  } else {
    throw new Error(paymentResult.message || 'Error en el pago');
  }
}

/**
 * Inicializa checkout para carrito
 */
export function initCartCheckout() {
  console.log('🛒 initCartCheckout() llamado');
  initCheckoutBase(getCartItems, onCheckoutSuccess);
  console.log('✅ initCartCheckout() completado');
}

/**
 * Valida que el carrito tenga items antes de checkout
 * @returns {boolean} Si el carrito es válido para checkout
 */
export function validateCartForCheckout() {
  const items = getCartItems();
  
  if (items.length === 0) {
    showToast('⚠️ Tu carrito está vacío', 'error');
    return false;
  }
  
  const total = getCartTotal();
  if (total <= 0) {
    showToast('⚠️ El total del carrito es inválido', 'error');
    return false;
  }
  
  return true;
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartCheckout);
} else {
  initCartCheckout();
}