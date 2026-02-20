// js/main.js – Single entry point with safe lazy imports

import { CONFIG } from './config.js';
import { showToast } from './ui.js';
import { addToCart, updateCartUI } from './cart.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('IMOLARTE – Main initialized');

  // Catalogue
  if (document.getElementById('products-grid')) {
    try {
      const { renderProducts, injectDonoButton } = await import('./catalog.js');
      renderProducts();
      injectDonoButton();
    } catch (err) {
      console.error('Catalogue load error:', err);
    }
  }

  // Cart
  if (document.getElementById('cartButton') || document.getElementById('cartPage')) {
    try {
      const { updateCartUI } = await import('./cart.js');
      updateCartUI();
    } catch (err) {
      console.error('Cart load error:', err);
    }
  }

  // Checkout
  if (document.getElementById('checkoutSection')) {
    try {
      const { initCheckout } = await import('./checkout.js');
      initCheckout();
    } catch (err) {
      console.error('Checkout load error:', err);
      showToast('Error al cargar checkout – refresca la página', 'error');
    }
  }
});