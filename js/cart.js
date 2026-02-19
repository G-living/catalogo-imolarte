// js/cart.js – Cart state & UI logic

import { showToast } from './ui.js';
import { formatPrice } from './utils.js'; // We'll create utils.js next if needed

// === STATE ===
let cart = JSON.parse(localStorage.getItem('imolarte_cart')) || [];

// === HELPERS ===
function saveCart() {
  localStorage.setItem('imolarte_cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function formatPrice(num) {
  return '$' + Number(num).toLocaleString('es-CO');
}

// === CORE FUNCTIONS ===
export function addToCart(product) {
  const { description, collection, code, price, quantity = 1 } = product;

  const existing = cart.find(item => item.code === code && item.collection === collection);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ description, collection, code, price: Number(price), quantity });
  }

  saveCart();
  updateCartUI();
  showToast(`Agregado: ${description} × ${quantity}`, 'success');
}

export function removeCartItem(code, collection) {
  cart = cart.filter(item => !(item.code === code && item.collection === collection));
  saveCart();
  updateCartUI();
  showToast('Producto eliminado', 'warning');
}

export function updateCartItemQuantity(code, collection, newQuantity) {
  const item = cart.find(i => i.code === code && i.collection === collection);
  if (item) {
    if (newQuantity <= 0) {
      removeCartItem(code, collection);
    } else {
      item.quantity = newQuantity;
      saveCart();
      updateCartUI();
    }
  }
}

export function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  showToast('Carrito vaciado', 'info');
}

// === UI UPDATE ===
export function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartTotalEl = document.getElementById('cart-total');
  const cartItemsEl = document.getElementById('cart-items');

  if (cartCount) cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (cartTotalEl) cartTotalEl.textContent = formatPrice(getCartTotal());

  if (cartItemsEl) {
    cartItemsEl.innerHTML = cart.length === 0 
      ? '<p>Tu carrito está vacío</p>'
      : cart.map(item => `
          <div class="cart-item">
            <div>
              <strong>${item.description}</strong><br>
              <small>${item.collection} - ${item.code}</small>
            </div>
            <div style="text-align:right;">
              ${formatPrice(item.price)} × 
              <input type="number" value="${item.quantity}" min="1" style="width:50px;" 
                onchange="updateCartItemQuantity('${item.code}', '${item.collection}', this.value)">
              = ${formatPrice(item.price * item.quantity)}
              <button onclick="removeCartItem('${item.code}', '${item.collection}')">×</button>
            </div>
          </div>
        `).join('');
  }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  console.log('Cart initialized – items:', cart.length);
});

// Exports
export { cart, addToCart, removeCartItem, updateCartItemQuantity, getCartTotal, clearCart, updateCartUI };