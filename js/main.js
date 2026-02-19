// js/main.js – Entry point – imports & initializes everything

import { CONFIG } from './config.js';
import { showToast } from './ui.js';
import { addToCart, updateCartUI } from './cart.js';
import { renderProducts, injectDonoButton } from './catalog.js';
import { openDonoModal } from './dono.js';
import { initCheckout } from './checkout.js';

// Global access if needed
window.addToCart = addToCart;
window.showToast = showToast;
window.openDonoModal = openDonoModal;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('IMOLARTE – Main v1.0 initialized');

  // Catalogue init
  if (document.getElementById('products-grid')) {
    renderProducts();
    injectDonoButton();
  }

  // Cart init
  if (document.getElementById('cartButton') || document.getElementById('cartPage')) {
    updateCartUI();
  }

  // Checkout init
  if (document.getElementById('checkoutSection')) {
    initCheckout();
  }
});