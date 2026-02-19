/**
 * checkout.js - FUNCIONES DE CHECKOUT
 * Solo exporta funciones, NO ejecuta nada automáticamente
 */

// ===== VARIABLES =====
let checkoutData = {
    firstName: '', lastName: '', email: '', phone: '',
    delivery: 'pickup', address: '', neighborhood: '', city: 'Bogotá', notes: ''
};

// ===== FUNCIONES EXPORTADAS =====

function openCheckoutModal(tipo = null) {
    if (!window.cart || window.cart.length === 0) {
        if (typeof showToast === 'function') {
            showToast('Tu carrito está vacío', 'warning');
        }
        return;
    }

    updateCheckoutSummary();

    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Inicializar checkout (solo una vez via core)
    if (typeof window.initCheckoutModules === 'function') {
        window.initCheckoutModules();
    }

    console.log('✅ Checkout abierto');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    resetCheckoutForm();
}

function updateCheckoutSummary() {
    const subtotal = typeof window.getCartTotal === 'function' ? window.getCartTotal() : 0;
    
    const subtotalSpan = document.getElementById('summarySubtotal');
    const totalSpan = document.getElementById('summaryTotal');
    
    if (subtotalSpan) subtotalSpan.textContent = formatPrice(subtotal);
    if (totalSpan) totalSpan.textContent = formatPrice(subtotal);
}

function resetCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    if (form) form.reset();
    
    document.querySelectorAll('.form-input.error').forEach(input => {
        input.classList.remove('error');
    });
}

function formatPrice(price) {
    return '$' + Math.round(price).toLocaleString('es-CO');
}

// ===== WHATSAPP =====
function sendToWhatsApp() {
    if (typeof window.validateCheckoutForm !== 'function' || !window.validateCheckoutForm()) {
        return;
    }

    const subtotal = typeof window.getCartTotal === 'function' ? window.getCartTotal() : 0;

    let message = '🛒 *PEDIDO IMOLARTE*\n';
    message += '━━━━━━━━━━━━━━━━━━━\n\n';
    message += `💵 *TOTAL: ${formatPrice(subtotal)}*\n\n`;
    message += '✅ Términos aceptados\n';
    message += '👋 ¡Gracias por tu pedido!';

    const whatsappURL = `https://wa.me/573004257367?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');

    setTimeout(() => {
        window.cart = [];
        if (typeof window.updateCartUI === 'function') window.updateCartUI();
        closeCheckoutModal();
        if (typeof showToast === 'function') {
            showToast('¡Pedido enviado!', 'success');
        }
    }, 1000);
}

// ===== EXPORTAR =====
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.sendToWhatsApp = sendToWhatsApp;
window.updateCheckoutSummary = updateCheckoutSummary;

console.log('✅ checkout.js cargado');