/**
 * ================================================================
 * IMOLARTE - CART.JS
 * ================================================================
 * Versión: 6.1 - Con botón CHECKOUT visible
 * ================================================================
 */

// ===== VARIABLES GLOBALES =====
window.cart = [];

// ===== FUNCIONES DE CARRITO =====

/**
 * Agrega producto al carrito
 */
function addToCart(description, collection, code, price, quantity) {
  const existingIndex = window.cart.findIndex(item => 
    item.code === code && item.collection === collection
  );

  if (existingIndex > -1) {
    window.cart[existingIndex].quantity += quantity;
  } else {
    window.cart.push({
      productName: description,
      collection: collection,
      code: code,
      price: Number(price),
      quantity: Number(quantity)
    });
  }

  updateCartUI();
  if (typeof window.showToast === 'function') {
    window.showToast(`✅ ${description} agregado al carrito`, 'success');
  }
  console.log('✅ Producto agregado:', description);
}

/**
 * Elimina un item del carrito
 */
function removeCartItem(code) {
  const index = window.cart.findIndex(item => item.code === code);
  if (index > -1) {
    window.cart.splice(index, 1);
    updateCartUI();
    if (typeof window.showToast === 'function') {
      window.showToast('🗑️ Producto eliminado', 'info');
    }
    console.log('🗑️ Producto eliminado');
  }
}

/**
 * Actualiza la cantidad de un item
 */
function updateCartItemQuantity(code, newQuantity) {
  const item = window.cart.find(item => item.code === code);
  if (item) {
    if (newQuantity <= 0) {
      removeCartItem(code);
    } else {
      item.quantity = Number(newQuantity);
      updateCartUI();
    }
  }
}

/**
 * Calcula el total del carrito
 */
function getCartTotal() {
  return window.cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

/**
 * Formatea precio
 */
function formatPrice(price) {
  const num = Number(price);
  if (isNaN(num)) return '$0';
  return '$' + num.toLocaleString('es-CO');
}

// ===== UI DEL CARRITO =====

/**
 * Actualiza toda la UI del carrito
 */
function updateCartUI() {
  updateCartCount();
  updateCartPage();
}

/**
 * Actualiza el badge del contador
 */
function updateCartCount() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const itemCount = window.cart.length;
    badge.textContent = itemCount;
    badge.style.display = itemCount > 0 ? 'flex' : 'none';
  }
}

/**
 * Actualiza la página del carrito - VERSIÓN CON BOTÓN CHECKOUT
 */
function updateCartPage() {
  const itemsContainer = document.getElementById('cartItems');
  const summaryContainer = document.getElementById('cartSummary');

  if (!itemsContainer || !summaryContainer) return;

  if (window.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p class="empty-text">Tu carrito está vacío</p>
      </div>
    `;
    summaryContainer.innerHTML = '';
    return;
  }

  // Renderizar items
  const itemsHTML = window.cart.map(item => {
    const comodinImage = getComodinImage(item.collection);
    const subtotal = item.price * item.quantity;

    return `
      <div class="cart-item" data-code="${item.code}">
        <img src="${comodinImage}" 
             alt="${item.collection}" 
             class="cart-item-image"
             onerror="this.style.display='none'">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.productName}</h3>
          <p class="cart-item-collection">${item.collection}</p>
          <p class="cart-item-code">${item.code}</p>
        </div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-qty">
          <button type="button" 
                  class="qty-btn" 
                  onclick="updateCartItemQuantity('${item.code}', ${item.quantity - 1})"
                  aria-label="Disminuir">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button type="button" 
                  class="qty-btn" 
                  onclick="updateCartItemQuantity('${item.code}', ${item.quantity + 1})"
                  aria-label="Aumentar">+</button>
        </div>
        <div class="cart-item-subtotal">${formatPrice(subtotal)}</div>
        <button type="button" 
                class="cart-item-remove" 
                onclick="removeCartItem('${item.code}')"
                aria-label="Eliminar">
          <span>🗑️</span>
        </button>
      </div>
    `;
  }).join('');

  itemsContainer.innerHTML = itemsHTML;

  // Renderizar resumen CON BOTÓN CHECKOUT
  const total = getCartTotal();
  const itemCount = window.cart.reduce((sum, item) => sum + item.quantity, 0);

  summaryContainer.innerHTML = `
    <div class="cart-summary">
      <div class="cart-summary-row">
        <span>Productos:</span>
        <span>${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}</span>
      </div>
      <div class="cart-summary-row total">
        <span>Total:</span>
        <span>${formatPrice(total)}</span>
      </div>
      <div class="cart-summary-actions">
        <button type="button" class="btn btn-checkout" onclick="openCheckoutModal()">
          CHECKOUT
        </button>
      </div>
    </div>
  `;
}

/**
 * Obtiene imagen comodín por colección
 */
function getComodinImage(collection) {
  const collectionMap = {
    'GIALLO FIORE': 'images/comodin/GIALLO FIORE.jpg',
    'BIANCO FIORE': 'images/comodin/BIANCO FIORE.jpg',
    'MAZZETTO': 'images/comodin/MAZZETTO.jpg',
    'GAROFANO BLU': 'images/comodin/GAROFANO BLU.jpg',
    'GAROFANO IMOLA': 'images/comodin/GAROFANO IMOLA.jpg',
    'GAROFANO TIFFANY': 'images/comodin/GAROFANO TIFFANY.jpg',
    'GAROFANO ROSA': 'images/comodin/GAROFANO ROSA.jpg',
    'GAROFANO LAVI': 'images/comodin/GAROFANO LAVI.jpg',
    'ROSSO E ORO': 'images/comodin/ROSSO E ORO.jpg',
    'AVORIO E ORO': 'images/comodin/AVORIO E ORO.jpg'
  };
  return collectionMap[collection] || 'images/comodin/default.jpg';
}

// ===== MOSTRAR/OCULTAR CARRITO =====

/**
 * Muestra la página del carrito
 */
function showCartPage() {
  const cartPage = document.getElementById('cartPage');
  if (cartPage) {
    cartPage.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCartUI();
    console.log('🛒 Carrito abierto');
  }
}

/**
 * Oculta la página del carrito
 */
function hideCartPage() {
  const cartPage = document.getElementById('cartPage');
  if (cartPage) {
    cartPage.classList.remove('active');
    document.body.style.overflow = 'auto';
    console.log('🛒 Carrito cerrado');
  }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando cart.js...');
  
  const cartBtn = document.getElementById('cartButton');
  if (cartBtn) {
    cartBtn.addEventListener('click', showCartPage);
  }

  const closeBtn = document.getElementById('closeCart');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideCartPage);
  }

  console.log('✅ Cart v6.1 inicializado');
});

// ===== EXPORTAR FUNCIONES =====
window.addToCart = addToCart;
window.removeCartItem = removeCartItem;
window.updateCartItemQuantity = updateCartItemQuantity;
window.getCartTotal = getCartTotal;
window.formatPrice = formatPrice;
window.updateCartUI = updateCartUI;
window.showCartPage = showCartPage;
window.hideCartPage = hideCartPage;