/**
 * core.js - PUNTO DE ENTRADA ÚNICO
 * Controla la inicialización diferida de todos los módulos
 */

const App = {
    // Estado de inicialización
    initialized: {
        cart: false,
        products: false,
        checkout: false,
        dono: false,
        places: false
    },

    // Inicialización principal (solo una vez)
    init: function() {
        console.log('🚀 Iniciando IMOLARTE Core...');
        
        // 1. Renderizar productos inmediatamente
        this.initProducts();
        
        // 2. Configurar listener del carrito (abrir cuando se necesite)
        this.setupCartButton();
        
        // 3. Configurar listener de Dono (abrir cuando se necesite)
        this.setupDonoButton();
        
        // 4. Configurar listeners globales (una sola vez)
        this.setupGlobalListeners();
        
        console.log('✅ Core inicializado');
    },

    // Renderizar productos (inmediato)
    initProducts: function() {
        if (this.initialized.products) return;
        
        if (typeof renderProducts === 'function') {
            renderProducts();
            this.initialized.products = true;
            console.log('✅ Productos renderizados');
        } else {
            console.warn('renderProducts no disponible, reintentando...');
            setTimeout(() => this.initProducts(), 100);
        }
    },

    // Botón del carrito (abre el carrito, no inicializa todo)
    setupCartButton: function() {
        const cartBtn = document.getElementById('cartButton');
        if (!cartBtn) {
            setTimeout(() => this.setupCartButton(), 100);
            return;
        }
        
        cartBtn.addEventListener('click', () => {
            console.log('🛒 Abriendo carrito...');
            
            // Inicializar cart.js si es necesario (solo una vez)
            if (!this.initialized.cart && typeof initCart === 'function') {
                initCart();
                this.initialized.cart = true;
            }
            
            if (typeof showCartPage === 'function') {
                showCartPage();
            }
        });
        
        console.log('✅ Botón carrito configurado');
    },

    // Botón Dono (abre modal Dono, no inicializa todo)
    setupDonoButton: function() {
        const donoBtn = document.getElementById('donoButton');
        if (!donoBtn) {
            setTimeout(() => this.setupDonoButton(), 100);
            return;
        }
        
        donoBtn.addEventListener('click', () => {
            console.log('🎁 Abriendo modal Dono...');
            
            // Inicializar dono.js si es necesario
            if (!this.initialized.dono && typeof initDonoModal === 'function') {
                initDonoModal();
                this.initialized.dono = true;
            }
            
            if (typeof openDonoModal === 'function') {
                openDonoModal();
            }
        });
        
        console.log('✅ Botón Dono configurado');
    },

    // Inicializar checkout (solo cuando se abre)
    initCheckout: function() {
        if (this.initialized.checkout) return;
        
        console.log('📋 Inicializando checkout...');
        
        // Inicializar en orden
        if (typeof initBirthdaySelectors === 'function') initBirthdaySelectors();
        if (typeof initGooglePlaces === 'function') initGooglePlaces();
        if (typeof initDonoCheckout === 'function') initDonoCheckout();
        
        this.initialized.checkout = true;
        console.log('✅ Checkout inicializado');
    },

    // Listeners globales (una sola vez)
    setupGlobalListeners: function() {
        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active, .cart-page.active, .checkout-modal.active')
                    .forEach(el => el.classList.remove('active'));
                document.body.style.overflow = '';
            }
        });
        
        console.log('✅ Listeners globales configurados');
    }
};

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}