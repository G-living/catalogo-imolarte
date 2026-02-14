// Gestión del carrito de compras
let cart = JSON.parse(localStorage.getItem('imolarte_cart') || '[]');

function saveCart() {
    localStorage.setItem('imolarte_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartBadge').textContent = total;
}

function addToCart(product, collection, code, price, quantity) {
    const existing = cart.find(item => item.code === code);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ productName: product, collection, code, price, quantity });
    }
    saveCart();
}

function removeFromCart(code) {
    cart = cart.filter(item => item.code !== code);
    saveCart();
}

function updateQuantity(code, quantity) {
    const item = cart.find(i => i.code === code);
    if (item) {
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) removeFromCart(code);
        else saveCart();
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
}

updateCartBadge();
