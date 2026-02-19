// js/catalog.js – Product rendering + Dono button injection

import { addToCart } from './cart.js';
import { showToast, formatPrice } from './ui.js'; // correct import
import { CONFIG } from './config.js';

// Dummy products – replace with real data later
const PRODUCTS = [
  { id: '001', description: 'Vaso Cerámico Clásico', collection: 'Classica', code: 'VCL-001', price: 150000, image: 'https://via.placeholder.com/300x300/cccccc/000000?text=Vaso+Classico' },
  { id: '002', description: 'Plato Decorativo Moderno', collection: 'Moderna', code: 'PDM-002', price: 280000, image: 'https://via.placeholder.com/300x300/cccccc/000000?text=Plato+Moderno' },
  // Add your real products here...
];

// Render catalogue
export function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) {
    console.warn('No #products-grid element found');
    return;
  }

  grid.innerHTML = ''; // Clear previous content

  PRODUCTS.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.description}" loading="lazy" style="width:100%; height:auto;">
      <h3>${product.description}</h3>
      <p>${product.collection}</p>
      <p class="price">${formatPrice(product.price)}</p>
      <button onclick="addToCart({description: '${product.description}', collection: '${product.collection}', code: '${product.code}', price: ${product.price}, quantity: 1})">
        Agregar al Carrito
      </button>
    `;
    grid.appendChild(card);
  });

  console.log(`Rendered ${PRODUCTS.length} products`);
}

// Inject Dono button below logo / first row
export function injectDonoButton() {
  const header = document.querySelector('header') || document.querySelector('h1')?.parentElement || document.body;
  const firstRow = document.querySelector('.catalog-grid') || document.querySelector('#products-grid') || document.querySelector('main');

  if (document.getElementById('dono-mode-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'dono-mode-btn';
  btn.innerHTML = '🎁 Modo Dono - Regala Crédito Exclusivo';
  btn.style.cssText = `
    margin: 40px auto 20px;
    padding: 18px 40px;
    font-size: 1.4rem;
    font-weight: bold;
    background: linear-gradient(135deg, #c9a96e, #b8975e);
    color: #1a1a1a;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(0,0,0,0.25);
    transition: all 0.3s ease;
    display: block;
  `;
  btn.onmouseover = () => { btn.style.transform = 'scale(1.05)'; btn.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)'; };
  btn.onmouseout = () => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)'; };
  btn.onclick = () => import('./dono.js').then(m => m.openDonoModal());

  if (firstRow && firstRow.parentNode) {
    firstRow.parentNode.insertBefore(btn, firstRow);
  } else if (header) {
    header.parentNode.insertBefore(btn, header.nextSibling);
  } else {
    document.body.prepend(btn);
  }

  console.log('🎁 Dono Mode button injected');
}