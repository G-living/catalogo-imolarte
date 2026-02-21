// js/ui.js
// IMOLARTE - Utilidades de UI

import { CONFIG } from './config.js';

/**
 * Formatea precio en COP para visualización
 * @param {number} price - Precio en COP
 * @returns {string} Precio formateado (ej: "$ 563.472")
 */
export function formatPrice(price) {
  if (!price || isNaN(price)) return '$ 0';
  return `$ ${price.toLocaleString('es-CO')}`;
}

/**
 * Formatea precio EUR para visualización
 * @param {number} price - Precio en EUR
 * @returns {string} Precio formateado (ej: "EUR 44,72")
 */
export function formatPriceEUR(price) {
  if (!price || isNaN(price)) return 'EUR 0,00';
  return `EUR ${price.toFixed(2).replace('.', ',')}`;
}

/**
 * Muestra notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
export function showToast(message, type = 'info') {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6'
  };
  
  Toastify({
    text: message,
    duration: 3000,
    gravity: 'top',
    position: 'center',
    backgroundColor: colors[type] || colors.info,
    stopOnFocus: true
  }).showToast();
}

/**
 * Valida cantidad dentro del límite permitido
 * @param {number} quantity - Cantidad a validar
 * @returns {number} Cantidad validada (0 a MAX_QUANTITY_PER_SKU)
 */
export function validateQuantity(quantity) {
  const qty = parseInt(quantity) || 0;
  return Math.max(0, Math.min(qty, CONFIG.MAX_QUANTITY_PER_SKU));
}

/**
 * Obtiene URL de imagen de producto (foto real)
 * @param {string} productCode - Código numérico (110, 001, etc.)
 * @returns {string} URL completa de la imagen
 */
export function getProductImageURL(productCode) {
  return `${CONFIG.IMAGE_PRODUCTS_URL}${productCode}.jpg`;
}

/**
 * Obtiene URL de comodín de colección
 * @param {string} comodinName - Nombre del archivo comodín
 * @returns {string} URL completa del comodín
 */
export function getComodinURL(comodinName) {
  return `${CONFIG.COMODINES_URL}${comodinName}`;
}

/**
 * Abre modal
 * @param {string} modalId - ID del modal
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Cierra modal
 * @param {string} modalId - ID del modal
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/**
 * Actualiza contador del carrito en header
 * @param {number} count - Número de items en carrito
 */
export function updateCartCount(count) {
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  
  if (!cartBtn || !cartCount) return;
  
  if (count <= 0) {
    cartBtn.innerHTML = '🛒 Carrito';
    cartCount.classList.add('hidden');
  } else {
    cartBtn.innerHTML = `🛒 Carrito (<span id="cart-count">${count}</span>)`;
    cartCount.classList.remove('hidden');
  }
}

/**
 * Muestra/oculta sección de checkout
 * @param {boolean} show - True para mostrar
 */
export function toggleCheckout(show) {
  const checkoutSection = document.getElementById('checkout-section');
  if (checkoutSection) {
    checkoutSection.classList.toggle('hidden', !show);
  }
}

/**
 * Obtiene información de colección por prefijo
 * @param {string} prefix - Prefijo de colección (GF, GB, etc.)
 * @returns {Object} Información de colección
 */
export function getCollectionInfo(prefix) {
  const collections = {
    'GF': { name: 'GIALLO FIORE', comodin: 'Giallo_Fiore.png' },
    'BF': { name: 'BIANCO FIORE', comodin: 'Bianco_Fiore.png' },
    'MZ': { name: 'MAZZETTO', comodin: 'Mazzetto.png' },
    'GB': { name: 'GAROFANO BLU', comodin: 'Garofano_Blu.png' },
    'GI': { name: 'GAROFANO IMOLA', comodin: 'Garofano_Imola.png' },
    'GT': { name: 'GAROFANO TIFFANY', comodin: 'Garofano_Tiffany.png' },
    'GR': { name: 'GAROFANO ROSA', comodin: 'Garofano_Rosa.png' },
    'GL': { name: 'GAROFANO LAVI', comodin: 'Garofano_Lavi.png' },
    'GRG': { name: 'ROSSO E ORO', comodin: 'Rosso_E_Oro.png' },
    'GIG': { name: 'AVORIO E ORO', comodin: 'Avorio_E_Oro.png' }
  };
  return collections[prefix] || { name: prefix, comodin: 'Garofano_Blu.png' };
}

/**
 * Formatea número de teléfono para WhatsApp
 * @param {string} phone - Número de teléfono
 * @returns {string} Número formateado
 */
export function formatWhatsAppNumber(phone) {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Genera mensaje de WhatsApp para pedido
 * @param {Array} cart - Items del carrito
 * @param {number} total - Total del pedido
 * @returns {string} Mensaje formateado
 */
export function generateWhatsAppMessage(cart, total) {
  let message = '¡Hola! Quiero realizar el siguiente pedido:\n\n';
  cart.forEach(item => {
    message += `• ${item.descripcion} (${item.coleccion}) - ${item.cantidad} x ${formatPrice(item.precio)}\n`;
  });
  message += `\n*Total: ${formatPrice(total)}*`;
  return encodeURIComponent(message);
}