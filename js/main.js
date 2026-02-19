// js/main.js – Entry point – imports & initializes only what's present

import { CONFIG } from './config.js';
import { showToast } from './ui.js';
import { addToCart, updateCartUI } from './cart.js';
import { renderProducts, injectDonoButton } from './catalog.js';
import { openDonoModal } from './dono.js';
import { initCheckout } from './checkout.js';

// Global access
window.addToCart = addToCart;
window.showToast = showToast;

// Lazy init – only activate what exists on page
document.addEventListener('DOMContentLoaded', () => {
  console.log('IMOLARTE – Main initialized');

  if (document.getElementById('products-grid')) {
    renderProducts();
    injectDonoButton();
  }

  if (document.getElementById('cartButton') || document.getElementById('cartPage')) {
    updateCartUI();
    // Cart listeners (in cart.js)
  }

  if (document.getElementById('checkoutSection') || document.getElementById('checkoutForm')) {
    initCheckout();
  }

  // Add more lazy inits as needed
});