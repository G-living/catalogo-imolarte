// js/main.js – Entry point – imports & initializes everything

import { CONFIG } from './config.js';
import { showToast } from './ui.js';
import { addToCart, updateCartUI } from './cart.js';
import { renderProducts, injectDonoButton } from './catalog.js'; // create catalog.js next
import { initDonoMode } from './dono.js'; // create dono.js next
import { initCheckout } from './checkout.js'; // create checkout.js next

// Global access if needed
window.addToCart = addToCart;
window.showToast = showToast;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('IMOLARTE – Main v1.0 initialized');

  // Render catalogue
  renderProducts();

  // Inject Dono button
  injectDonoButton();

  // Init checkout flow
  initCheckout();

  // Cart UI update
  updateCartUI();

  // Any other global setup...
});