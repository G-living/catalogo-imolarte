// js/catalog.js
// IMOLARTE - Catálogo Grid Principal (CON DEBUG)

import { CONFIG } from './config.js';
import { addToCart } from './cart.js';
import { formatPrice, formatPriceEUR, showToast, closeModal } from './ui.js';

console.log('🔍 catalog.js cargado');
console.log('📍 CONFIG.BASE_URL:', CONFIG.BASE_URL);

let productsCache = [];
let productsLoaded = false;
let groupedProducts = {};

export async function loadProducts() {
  console.log('📥 loadProducts() llamado');
  
  if (productsLoaded) {
    console.log('✅ Ya cargados:', productsCache.length);
    return productsCache;
  }
  
  const csvUrl = `${CONFIG.BASE_URL}/listino/catalogo-imolarte.csv`;
  console.log('🌐 Intentando fetch:', csvUrl);
  
  try {
    console.log('⏳ Fetch iniciando...');
    const response = await fetch(csvUrl);
    console.log('📊 Response status:', response.status, response.statusText);
    console.log('📊 Response OK:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('📄 Leyendo texto...');
    const csvText = await response.text();
    console.log('📄 CSV length:', csvText.length, 'chars');
    console.log('📋 First 500 chars:', csvText.substring(0, 500));
    
    productsCache = parseCSV(csvText);
    groupedProducts = groupByProductCode(productsCache);
    productsLoaded = true;
    
    console.log(`✅ ${productsCache.length} productos parseados`);
    console.log('📦 Productos únicos:', Object.keys(groupedProducts).length);
    
    return productsCache;
    
  } catch (error) {
    console.error('❌ ERROR CARGANDO CSV:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    showToast('⚠️ Error cargando catálogo. Revisa la consola.', 'error');
    productsCache = [];
    return [];
  }
}

function parseCSV(csvText) {
  console.log('🔍 parseCSV() iniciado');
  const lines = csvText.trim().split('\n');
  console.log('📊 Total líneas:', lines.length);
  
  if (lines.length < 2) {
    console.error('❌ CSV sin datos');
    return [];
  }
  
  const headers = lines[0].split(';').map(h => h.trim());
  console.log('📋 Headers:', headers);
  
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
  
  console.log('✅ parseCSV completo:', products.length);
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
  console.log('📦 Agrupados:', Object.keys(grouped).length);
  return grouped;
}

export async function renderCatalog(gridElement) {
  console.log('🎨 renderCatalog() llamado');
  console.log('📦 Grid element:', gridElement);
  
  if (!gridElement) {
    console.error('❌ Grid element NOT FOUND');
    return;
  }
  
  gridElement.innerHTML = '<div class="loading">Cargando productos...</div>';
  
  const products = await loadProducts();
  console.log('📊 Productos cargados:', products.length);
  
  if (products.length === 0) {
    console.warn('⚠️ No hay productos');
    gridElement.innerHTML = '<div class="no-products">No hay productos disponibles</div>';
    return;
  }
  
  gridElement.innerHTML = '';
  console.log('🎨 Renderizando...');
  
  Object.values(groupedProducts).forEach(product => {
    const card = createProductCard(product);
    gridElement.appendChild(card);
  });
  
  console.log('✅ Renderizado completo');
  
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
  console.log('🖼️ Card:', product.descripcion, '- Foto:', product.fotoReal);
  
  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('data-product-code', product.codigo);
  const imageUrl = `${CONFIG.IMAGE_PRODUCTS_URL}${product.fotoReal}`;
  console.log('   📷 URL:', imageUrl);
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${imageUrl}" alt="${product.descripcion}" loading="lazy" onerror="console.error('❌ Image error:', this.src); this.style.display='none'">
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.descripcion}</h3>
    </div>
  `;
  
  return card;
}

function openProductDetail(productCode) {
  console.log('🔍 openProductDetail:', productCode);
  const product = groupedProducts[productCode];
  if (!product) {
    console.error('❌ Producto no encontrado:', productCode);
    return;
  }
  
  const modal = document.getElementById('product-detail-modal');
  if (!modal) {
    console.error('❌ Modal no encontrado');
    return;
  }
  
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

export function addProductToCart() {
  console.log('🛒 addProductToCart() llamado');
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
    showToast(`✅ ${itemsAdded} artículo(s) agregado(s)`, 'success');
    closeModal('product-detail-modal');
  } else {
    showToast('⚠️ Selecciona al menos 1 unidad', 'info');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOMContentLoaded en catalog.js');
  
  const grid = document.getElementById('products-grid');
  console.log('🔍 Grid:', grid);
  
  if (grid && grid.children.length === 0) {
    console.log('🎨 Llamando renderCatalog...');
    renderCatalog(grid);
  } else {
    console.warn('⚠️ Grid no encontrado o ya tiene contenido');
  }
  
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) addToCartBtn.addEventListener('click', addProductToCart);
  
  const closeBtns = document.querySelectorAll('.close-modal');
  closeBtns.forEach(btn => btn.addEventListener('click', () => { closeModal('product-detail-modal'); closeModal('cart-modal'); }));
  
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