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
 * Verifica si una imagen existe (mediante fetch HEAD)
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>} True si existe
 */
export async function imageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Abre modal de detalle de producto
 * @param {string} productId - ID del producto
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
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = count;
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