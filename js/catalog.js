// js/catalog.js
// IMOLARTE - Catálogo Grid Principal

import { CONFIG } from './config.js';
import { addToCart } from './cart.js';  // ← Verificar que cart.js exporta addToCart
import { formatPrice, formatPriceEUR, showToast, openModal, closeModal, getComodinURL, getProductImageURL } from './ui.js';

// ============================================================================
// ESTADO GLOBAL
// ============================================================================

let productsCache = [];
let productsLoaded = false;
let groupedProducts = {};

// ============================================================================
// CARGAR PRODUCTOS DESDE CSV
// ============================================================================

export async function loadProducts() {
  if (productsLoaded) return productsCache;
  
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/listino/catalogo-imolarte.csv`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    
    const csvText = await response.text();
    productsCache = parseCSV(csvText);
    groupedProducts = groupByProductCode(productsCache);
    productsLoaded = true;
    
    console.log(`✅ ${productsCache.length} productos cargados desde CSV`);
    return productsCache;
  } catch (error) {
    console.error('❌ Error cargando productos desde CSV:', error);
    productsCache = [];
    return [];
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(';').map(h => h.trim());
  const products = [];
  let currentDescription = '';
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;
    
    const product = {};
    headers.forEach((header, index) => {
      product[header] = values[index] ? values[index].replace(/^"|"$/g, '').replace(/""/g, '"') : '';
    });
    
    if (product.Descripcion) currentDescription = product.Descripcion;
    else product.Descripcion = currentDescription;
    
    const precioEURString = product.Precio_EUR ? product.Precio_EUR.replace('EUR ', '').replace(',', '.') : '0';
    const precioCOPString = product.Precio_COP ? product.Precio_COP.replace('COP ', '').replace(/\./g, '') : '0';
    
    products.push({
      descripcion: product.Descripcion,
      coleccion: product.Colección,
      prefijo: product.Prefijo_Coleccion,
      codigoProducto: product.Codigo_Producto,
      sku: product.SKU,
      comodin: product.Foto_Comodin_Coleccion,
      fotoReal: product.Foto_Real_Codigo_Producto,
      precioEUR: parseFloat(precioEURString) || 0,
      precioCOP: parseInt(precioCOPString) || 0
    });
  }
  return products;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ';' && !inQuotes) { values.push(current.trim()); current = ''; }
    else current += char;
  }
  values.push(current.trim());
  return values;
}

function groupByProductCode(products) {
  const grouped = {};
  products.forEach(product => {
    if (!grouped[product.codigoProducto]) {
      grouped[product.codigoProducto] = {
        codigo: product.codigoProducto,
        descripcion: product.descripcion,
        fotoReal: product.fotoReal,
        variantes: []
      };
    }
    grouped[product.codigoProducto].variantes.push(product);
  });
  return grouped;
}

// ============================================================================
// RENDERIZADO DEL GRID
// ============================================================================

export async function renderCatalog(gridElement) {
  if (!gridElement) { console.error('Grid element not found'); return; }
  
  gridElement.innerHTML = '<div class="loading">Cargando productos...</div>';
  const products = await loadProducts();
  
  if (products.length === 0) {
    gridElement.innerHTML = '<div class="no-products">No hay productos disponibles</div>';
    return;
  }
  
  gridElement.innerHTML = '';
  Object.values(groupedProducts).forEach(product => {
    const card = createProductCard(product);
    gridElement.appendChild(card);
  });
  
  gridElement.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-add') && !e.target.closest('.btn-add')) {
        const productCode = card.dataset.productCode;
        openProductDetail(productCode);
      }
    });
  });
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('data-product-code', product.codigo);
  const imageUrl = `${CONFIG.IMAGE_PRODUCTS_URL}${product.fotoReal}`;
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${imageUrl}" alt="${product.descripcion}" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.descripcion}</h3>
    </div>
  `;
  return card;
}

// ============================================================================
// DETALLE DE PRODUCTO
// ============================================================================

function openProductDetail(productCode) {
  const product = groupedProducts[productCode];
  if (!product) return;
  
  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;
  
  modal.dataset.productCode = productCode;
  
  const detailImage = document.getElementById('detail-image');
  const detailDescription = document.getElementById('detail-description');
  if (detailImage) { detailImage.src = `${CONFIG.IMAGE_PRODUCTS_URL}${product.fotoReal}`; detailImage.alt = product.descripcion; }
  if (detailDescription) detailDescription.textContent = product.descripcion;
  
  const variantsContainer = document.getElementById('detail-variants');
  if (variantsContainer) {
    variantsContainer.innerHTML = '';
    product.variantes.forEach(variante => {
      const variantRow = createVariantRow(variante);
      variantsContainer.appendChild(variantRow);
    });
  }
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function createVariantRow(variante) {
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.dataset.sku = variante.sku;
  const comodinUrl = `${CONFIG.COMODINES_URL}${variante.comodin}`;
  
  row.innerHTML = `
    <div class="variant-image"><img src="${comodinUrl}" alt="${variante.coleccion}"></div>
    <div class="variant-info">
      <h4 class="variant-collection">${variante.coleccion}</h4>
      <p class="variant-sku">${variante.sku}</p>
      <p class="variant-price-eur">${formatPriceEUR(variante.precioEUR)}</p>
      <p class="variant-price-cop">${formatPrice(variante.precioCOP)}</p>
    </div>
    <div class="variant-quantity">
      <button class="qty-btn qty-minus" data-sku="${variante.sku}">-</button>
      <input type="number" class="qty-input" value="0" min="0" max="${CONFIG.MAX_QUANTITY_PER_SKU}" data-sku="${variante.sku}">
      <button class="qty-btn qty-plus" data-sku="${variante.sku}">+</button>
    </div>
    <div class="variant-subtotal">
      <span class="subtotal-label">Subtotal:</span>
      <span class="subtotal-value" data-sku="${variante.sku}">$ 0</span>
    </div>
  `;
  
  const minusBtn = row.querySelector('.qty-minus');
  const plusBtn = row.querySelector('.qty-plus');
  const qtyInput = row.querySelector('.qty-input');
  if (minusBtn) minusBtn.addEventListener('click', () => updateQuantity(variante.sku, -1));
  if (plusBtn) plusBtn.addEventListener('click', () => updateQuantity(variante.sku, 1));
  if (qtyInput) qtyInput.addEventListener('change', (e) => setQuantity(variante.sku, e.target.value));
  return row;
}

function updateQuantity(sku, delta) {
  const input = document.querySelector(`.qty-input[data-sku="${sku}"]`);
  if (!input) return;
  let value = parseInt(input.value) || 0;
  value = Math.max(0, Math.min(value + delta, CONFIG.MAX_QUANTITY_PER_SKU));
  input.value = value;
  updateSubtotal(sku, value);
}

function setQuantity(sku, value) {
  const input = document.querySelector(`.qty-input[data-sku="${sku}"]`);
  if (!input) return;
  value = Math.max(0, Math.min(parseInt(value) || 0, CONFIG.MAX_QUANTITY_PER_SKU));
  input.value = value;
  updateSubtotal(sku, value);
}

function updateSubtotal(sku, quantity) {
  const variant = productsCache.find(p => p.sku === sku);
  const subtotalEl = document.querySelector(`.subtotal-value[data-sku="${sku}"]`);
  if (variant && subtotalEl) subtotalEl.textContent = formatPrice(variant.precioCOP * quantity);
}

// ============================================================================
// AGREGAR AL CARRITO
// ============================================================================

export function addProductToCart() {
  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;
  
  const productCode = modal.dataset.productCode;
  const product = groupedProducts[productCode];
  if (!product) return;
  
  let itemsAdded = 0;
  product.variantes.forEach(variante => {
    const input = document.querySelector(`.qty-input[data-sku="${variante.sku}"]`);
    const quantity = parseInt(input?.value) || 0;
    if (quantity > 0) {
      addToCart({
        sku: variante.sku,
        descripcion: product.descripcion,
        coleccion: variante.coleccion,
        precio: variante.precioCOP,
        cantidad: quantity,
        imagen: variante.comodin || 'Garofano_Blu.png'
      });
      itemsAdded += quantity;
    }
  });
  
  if (itemsAdded > 0) {
    showToast(`✅ ${itemsAdded} artículo(s) agregado(s) al carrito`, 'success');
    closeModal('product-detail-modal');
  } else {
    showToast('⚠️ Selecciona al menos 1 unidad', 'info');
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('products-grid');
  if (grid && grid.children.length === 0) renderCatalog(grid);
  
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) addToCartBtn.addEventListener('click', addProductToCart);
  
  const closeBtns = document.querySelectorAll('.close-modal');
  closeBtns.forEach(btn => btn.addEventListener('click', () => { closeModal('product-detail-modal'); closeModal('cart-modal'); }));
  
  // Bind botón carrito en header
  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cart-modal');
  if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cartModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (typeof renderCart === 'function') renderCart();
    });
  }
});