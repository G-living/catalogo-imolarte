// js/cart.js
// IMOLARTE - Carrito de Compras (Límite 20 por SKU, subtotales)

import { CONFIG } from './config.js';
import { formatPrice, showToast, updateCartCount } from './ui.js';

// ============================================================================
// ESTADO GLOBAL
// ============================================================================

let cart = [];
const CART_STORAGE_KEY = 'imolarte_cart';

// ============================================================================
// FUNCIONES PÚBLICAS
// ============================================================================

/**
 * Agrega item al carrito
 * @param {Object} item - Item a agregar
 */
export function addToCart(item) {
  // Validar que cantidad tenga valor
  const quantity = item.cantidad || 0;
  
  if (quantity <= 0) {
    showToast('⚠️ Cantidad inválida', 'error');
    return;
  }
  
  const existingIndex = cart.findIndex(i => i.sku === item.sku);
  
  if (existingIndex !== -1) {
    // Actualizar cantidad existente
    const newQuantity = cart[existingIndex].cantidad + quantity;
    
    if (newQuantity > CONFIG.MAX_QUANTITY_PER_SKU) {
      showToast(`⚠️ Máximo ${CONFIG.MAX_QUANTITY_PER_SKU} unidades por SKU`, 'error');
      cart[existingIndex].cantidad = CONFIG.MAX_QUANTITY_PER_SKU;
    } else {
      cart[existingIndex].cantidad = newQuantity;
    }
  } else {
    // Nuevo item
    if (quantity > CONFIG.MAX_QUANTITY_PER_SKU) {
      item.cantidad = CONFIG.MAX_QUANTITY_PER_SKU;
      showToast(`⚠️ Cantidad ajustada a máximo ${CONFIG.MAX_QUANTITY_PER_SKU}`, 'info');
    } else {
      item.cantidad = quantity;
    }
    cart.push(item);
  }
  
  saveCart();
  renderCart();
  updateCartCount(getCartItemCount());
}

/**
 * Actualiza cantidad de item en carrito
 * @param {string} sku - SKU del item
 * @param {number} quantity - Nueva cantidad
 */
export function updateCartItemQuantity(sku, quantity) {
  const item = cart.find(i => i.sku === sku);
  if (!item) return;
  
  quantity = Math.max(0, Math.min(quantity || 0, CONFIG.MAX_QUANTITY_PER_SKU));
  item.cantidad = quantity;
  
  if (quantity === 0) {
    removeFromCart(sku);
  } else {
    saveCart();
    renderCart();
    updateCartCount(getCartItemCount());
  }
}

/**
 * Remueve item del carrito
 * @param {string} sku - SKU del item
 */
export function removeFromCart(sku) {
  cart = cart.filter(i => i.sku !== sku);
  saveCart();
  renderCart();
  updateCartCount(getCartItemCount());
  showToast('🗑️ Item eliminado del carrito', 'info');
}

/**
 * Limpia carrito completo
 */
export function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  updateCartCount(0);
  showToast('🧹 Carrito vaciado', 'info');
}

/**
 * Obtiene total del carrito
 * @returns {number} Total en COP
 */
export function getCartTotal() {
  return cart.reduce((total, item) => total + ((item.precio || 0) * (item.cantidad || 0)), 0);
}

/**
 * Obtiene número total de items en carrito
 * @returns {number} Cantidad de items
 */
export function getCartItemCount() {
  return cart.reduce((count, item) => count + (item.cantidad || 0), 0);
}

/**
 * Obtiene carrito actual
 * @returns {Array} Items del carrito
 */
export function getCart() {
  return [...cart];
}

// ============================================================================
// PERSISTENCIA
// ============================================================================

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    cart = [];
  }
}

// ============================================================================
// RENDERIZADO
// ============================================================================

export function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  const cartCount = document.getElementById('cart-count');
  
  if (!cartItemsContainer) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
    if (cartTotalAmount) cartTotalAmount.textContent = formatPrice(0);
    if (cartCount) cartCount.textContent = '0';
    return;
  }
  
  cartItemsContainer.innerHTML = '';
  let total = 0;
  let itemCount = 0;
  
  cart.forEach(item => {
    const subtotal = (item.precio || 0) * (item.cantidad || 0);
    total += subtotal;
    itemCount += (item.cantidad || 0);
    
    const cartItem = createCartItem(item);
    cartItemsContainer.appendChild(cartItem);
  });
  
  if (cartTotalAmount) cartTotalAmount.textContent = formatPrice(total);
  if (cartCount) cartCount.textContent = itemCount;
}

function createCartItem(item) {
  const cartItem = document.createElement('div');
  cartItem.className = 'cart-item';
  cartItem.dataset.sku = item.sku;
  
  // Validar que imagen tenga valor
  const imagenName = item.imagen || 'Garofano_Blu.png';
  const imageUrl = `${CONFIG.COMODINES_URL}${imagenName}`;
  const subtotal = (item.precio || 0) * (item.cantidad || 0);
  
  cartItem.innerHTML = `
    <div class="cart-item-image">
      <img src="${imageUrl}" alt="${item.coleccion || 'Producto'}">
    </div>
    <div class="cart-item-info">
      <h4 class="cart-item-name">${item.descripcion || 'Producto'}</h4>
      <p class="cart-item-collection">${item.coleccion || ''}</p>
      <p class="cart-item-sku">${item.sku || ''}</p>
      <p class="cart-item-price">${formatPrice(item.precio || 0)} c/u</p>
    </div>
    <div class="cart-item-quantity">
      <button class="qty-btn qty-minus" data-sku="${item.sku}">-</button>
      <input type="number" class="qty-input" value="${item.cantidad || 0}" min="0" max="${CONFIG.MAX_QUANTITY_PER_SKU}" data-sku="${item.sku}">
      <button class="qty-btn qty-plus" data-sku="${item.sku}">+</button>
    </div>
    <div class="cart-item-subtotal">
      <span class="subtotal-label">Total:</span>
      <span class="subtotal-value">${formatPrice(subtotal)}</span>
    </div>
    <button class="cart-item-remove" data-sku="${item.sku}">🗑️</button>
  `;
  
  // Bind events
  const minusBtn = cartItem.querySelector('.qty-minus');
  const plusBtn = cartItem.querySelector('.qty-plus');
  const qtyInput = cartItem.querySelector('.qty-input');
  const removeBtn = cartItem.querySelector('.cart-item-remove');
  
  if (minusBtn) minusBtn.addEventListener('click', () => updateCartItemQuantity(item.sku, (item.cantidad || 0) - 1));
  if (plusBtn) plusBtn.addEventListener('click', () => updateCartItemQuantity(item.sku, (item.cantidad || 0) + 1));
  if (qtyInput) qtyInput.addEventListener('change', (e) => updateCartItemQuantity(item.sku, parseInt(e.target.value) || 0));
  if (removeBtn) removeBtn.addEventListener('click', () => removeFromCart(item.sku));
  
  return cartItem;
}

// ============================================================================
// CHECKOUT
// ============================================================================

export function proceedToCheckout() {
  if (cart.length === 0) {
    showToast('⚠️ Tu carrito está vacío', 'error');
    return;
  }
  
  // Redirigir a sección de checkout
  const checkoutSection = document.getElementById('checkout-section');
  const cartModal = document.getElementById('cart-modal');
  
  if (checkoutSection) {
    checkoutSection.classList.remove('hidden');
    if (cartModal) cartModal.classList.add('hidden');
    document.body.style.overflow = '';
    showToast('📋 Completa tus datos para continuar', 'info');
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  renderCart();
  updateCartCount(getCartItemCount());
  
  // Bind botón checkout
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
});