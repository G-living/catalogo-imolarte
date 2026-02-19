// js/catalog.js – Catalogue rendering (Garofano Blu only + popup for all collections)

import { addToCart, updateCartUI } from './cart.js';
import { showToast, formatPrice, createModal } from './ui.js';
import { CONFIG } from './config.js';

// Products from your price list (Euro ex-works)
// Only Garofano Blu rendered on main index (real pics)
// All collections shown in popup with comodin pics
const PRODUCTS = [
  // Garofano Blu only on main catalogue (real pics)
  { sku: 'GB110', name: 'New appetizer plate', collection: 'GAROFANO BLU', euroPrice: 64.2, image: '/images/GB110.jpg' },
  { sku: 'GB105', name: 'Appetizer plate', collection: 'GAROFANO BLU', euroPrice: 64.2, image: '/images/GB105.jpg' },
  { sku: 'GB106', name: 'Soup serving bowl x 12', collection: 'GAROFANO BLU', euroPrice: 224.328, image: '/images/GB106.jpg' },
  // ... add all Garofano Blu SKUs from your Excel ...
];

// All collections (for popup) – comodin pics for non-Blu
const ALL_COLLECTIONS = [
  { collection: 'GIALLO FIORE', comodinImage: '/images/comodin-giallo.jpg' },
  { collection: 'BIANCO FIORE', comodinImage: '/images/comodin-bianco.jpg' },
  { collection: 'MAZZETTO', comodinImage: '/images/comodin-mazzetto.jpg' },
  { collection: 'GAROFANO BLU', comodinImage: '/images/GB110.jpg' }, // real for Blu
  { collection: 'GAROFANO IMOLA', comodinImage: '/images/comodin-imola.jpg' },
  { collection: 'GAROFANO TIFFANY', comodinImage: '/images/comodin-tiffany.jpg' },
  { collection: 'GAROFANO GRGSA', comodinImage: '/images/comodin-grgsa.jpg' },
  { collection: 'GAROFANO LAVI', comodinImage: '/images/comodin-lavi.jpg' },
  { collection: 'GAROFANO ROSSO E ORO', comodinImage: '/images/comodin-rosso-oro.jpg' },
  { collection: 'GAROFANO AVORIO E ORO', comodinImage: '/images/comodin-avorio-oro.jpg' },
];

// Render main catalogue – only Garofano Blu
export function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = '';

  PRODUCTS.forEach(product => {
    const copPrice = Math.round(product.euroPrice * CONFIG.PRICING_MULTIPLIER);

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <p class="sku">Código: ${product.sku}</p>
      <h3>${product.name}</h3>
      <p>${product.collection}</p>
      <p class="price">${formatPrice(copPrice)}</p>
      <button class="view-details">Ver Detalles</button>
    `;
    card.querySelector('.view-details').onclick = () => openProductPopup(product);
    grid.appendChild(card);
  });

  if (PRODUCTS.length === 0) {
    grid.innerHTML = '<p style="text-align:center; padding:40px;">Catálogo en construcción – Garofano Blu próximamente</p>';
  }

  console.log(`Rendered ${PRODUCTS.length} Garofano Blu products`);
}

// Popup for full collections
function openProductPopup(mainProduct) {
  const modal = createModal(mainProduct.name, `
    <img src="${mainProduct.image}" alt="${mainProduct.name}" style="width:100%; max-height:400px; object-fit:contain; margin-bottom:20px;">
    <h3>${mainProduct.name} - Garofano Blu</h3>
    <p>Selecciona colección y cantidad:</p>
    <div id="collection-options"></div>
    <button id="add-selected-to-cart" style="width:100%; padding:16px; background:#b8975e; color:white; border:none; border-radius:12px; font-size:1.3rem; margin-top:20px;">
      Agregar a Carrito
    </button>
  `);

  const optionsDiv = modal.querySelector('#collection-options');

  ALL_COLLECTIONS.forEach(col => {
    const line = document.createElement('div');
    line.style.cssText = 'display:flex; align-items:center; gap:16px; margin-bottom:16px; padding:12px; border-bottom:1px solid #eee;';
    line.innerHTML = `
      <img src="${col.comodinImage}" alt="${col.collection}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
      <div style="flex:1;">
        <strong>${col.collection}</strong><br>
        <small>Código: ${mainProduct.sku.replace('GB', col.collection.charAt(0) + col.collection.charAt(1))}</small>
      </div>
      <p style="font-weight:bold;">${formatPrice(Math.round(mainProduct.euroPrice * CONFIG.PRICING_MULTIPLIER))}</p>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="qty-btn" onclick="this.nextElementSibling.value = Math.max(0, parseInt(this.nextElementSibling.value) - 1)">-</button>
        <input type="number" value="0" min="0" style="width:60px; text-align:center;">
        <button class="qty-btn" onclick="this.previousElementSibling.value = parseInt(this.previousElementSibling.value) + 1">+</button>
      </div>
    `;
    optionsDiv.appendChild(line);
  });

  modal.querySelector('#add-selected-to-cart').onclick = () => {
    let added = 0;
    optionsDiv.querySelectorAll('input[type="number"]').forEach(input => {
      const qty = parseInt(input.value);
      if (qty > 0) {
        const line = input.closest('div');
        const collection = line.querySelector('strong').textContent;
        const sku = line.querySelector('small').textContent.replace('Código: ', '');
        const price = parseFloat(line.querySelector('p[style*="font-weight"]').textContent.replace(/[^0-9]/g, ''));
        addToCart({ description: `${mainProduct.name} - ${collection}`, collection, code: sku, price, quantity: qty });
        added += qty;
      }
    });

    if (added > 0) {
      showToast(`Producto agregado (${added} items)`, 'success');
    } else {
      showToast('Selecciona al menos una cantidad', 'error');
    }
    modal.remove();
  };
}