// checkout.js - Gestión del checkout, validaciones, Wompi y WhatsApp
// COMPLETO - Con toast en lugar de alerts
// Versión: 2.2 - CORREGIDO: initBirthdaySelectors definida ANTES de usarse

// ===== CONSTANTES =====
const WOMPI_PUBLIC_KEY = 'pub_test_rT7K8rzYnk2Ec8Lv25tRL3JIof6b6Lwp';
const WHATSAPP_NUMBER = '573004257367';

// ===== VARIABLES GLOBALES =====
let checkoutData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    delivery: 'pickup',
    address: '',
    neighborhood: '',
    city: 'Bogotá',
    notes: ''
};

// ===== FUNCIÓN CRÍTICA QUE FALTABA =====
function initBirthdaySelectors() {
    console.log('🎂 Inicializando selectores de cumpleaños...');
    
    const daySelect = document.getElementById('birthdayDay');
    const monthSelect = document.getElementById('birthdayMonth');
    
    if (!daySelect || !monthSelect) {
        console.warn('Selectores de cumpleaños no encontrados');
        return;
    }
    
    // Limpiar opciones existentes
    daySelect.innerHTML = '<option value="">Día</option>';
    monthSelect.innerHTML = '<option value="">Mes</option>';
    
    // Días del 1 al 31
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Meses
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    console.log('✅ Selectores de cumpleaños inicializados');
}

// ===== FUNCIONES PRINCIPALES =====

/**
 * Abre el modal de checkout
 * @param {string} tipo - 'whatsapp' o 'wompi' para ocultar opciones
 */
function openCheckoutModal(tipo = null) {
    if (window.cart.length === 0) {
        showToast('Tu carrito está vacío', 'warning');
        return;
    }

    // Actualizar resumen
    updateCheckoutSummary();

    // Mostrar modal
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Inicializar Google Places
    setTimeout(() => {
        if (typeof window.initGooglePlaces === 'function') {
            window.initGooglePlaces();
        }
    }, 100);
    
    // Manejar opciones de pago
    setTimeout(() => {
        if (tipo === 'whatsapp') {
            ocultarOpcionesWompi();
        } else if (tipo === 'wompi') {
            ocultarOpcionWhatsApp();
        } else {
            mostrarTodasLasOpciones();
        }
    }, 400);

    console.log('✅ Modal de checkout abierto - tipo:', tipo);
}

/**
 * Cierra el modal de checkout
 */
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetCheckoutForm();
    }
}

/**
 * Cierra la página del carrito
 */
function closeCartPage() {
    const cartPage = document.getElementById('cartPage');
    if (cartPage) {
        cartPage.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Actualiza el resumen del checkout
 */
function updateCheckoutSummary() {
    const subtotal = window.getCartTotal ? window.getCartTotal() : 0;
    
    const subtotalSpan = document.getElementById('summarySubtotal');
    const totalSpan = document.getElementById('summaryTotal');
    
    if (subtotalSpan) subtotalSpan.textContent = window.formatPrice ? window.formatPrice(subtotal) : '$' + subtotal;
    if (totalSpan) totalSpan.textContent = window.formatPrice ? window.formatPrice(subtotal) : '$' + subtotal;
    
    const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
    const shippingSpan = document.getElementById('summaryShipping');
    
    if (shippingSpan) {
        if (deliveryMethod && deliveryMethod.value === 'home') {
            shippingSpan.textContent = 'A calcular';
        } else {
            shippingSpan.textContent = '$0';
        }
    }
}

/**
 * Resetea el formulario de checkout
 */
function resetCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    if (form) {
        form.reset();
    }
    
    checkoutData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        delivery: 'pickup',
        address: '',
        neighborhood: '',
        city: 'Bogotá',
        notes: ''
    };

    const addressFields = document.getElementById('addressFields');
    if (addressFields) {
        addressFields.classList.remove('active');
    }

    document.querySelectorAll('.form-input.error').forEach(input => {
        input.classList.remove('error');
    });
}

// ===== VALIDACIONES =====

/**
 * Valida el formulario completo
 */
function validateCheckoutForm() {
    let isValid = true;
    const errors = [];

    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error');
    });

    const firstName = document.getElementById('firstName');
    if (!firstName.value.trim() || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(firstName.value)) {
        firstName.classList.add('error');
        errors.push('Nombre inválido');
        isValid = false;
    }

    const lastName = document.getElementById('lastName');
    if (!lastName.value.trim() || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(lastName.value)) {
        lastName.classList.add('error');
        errors.push('Apellido inválido');
        isValid = false;
    }

    const docType = document.getElementById('docType');
    if (!docType.value || docType.value === '') {
        docType.classList.add('error');
        errors.push('Selecciona tipo de documento');
        isValid = false;
    }

    const docNumber = document.getElementById('docNumber');
    if (!docNumber.value.trim() || !/^[0-9]+$/.test(docNumber.value)) {
        docNumber.classList.add('error');
        errors.push('Número de documento inválido');
        isValid = false;
    }

    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        email.classList.add('error');
        errors.push('Email inválido');
        isValid = false;
    }

    const phone = document.getElementById('phone');
    const phoneVal = phone.value.replace(/\D/g, '');
    if (phoneVal.length !== 10) {
        phone.classList.add('error');
        errors.push('Teléfono debe tener 10 dígitos');
        isValid = false;
    }

    const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
    if (!deliveryMethod) {
        errors.push('Selecciona un método de entrega');
        isValid = false;
    }

    if (deliveryMethod && deliveryMethod.value === 'home') {
        const address = document.getElementById('address');
        const neighborhood = document.getElementById('neighborhood');
        const city = document.getElementById('city');

        if (!address.value.trim()) {
            address.classList.add('error');
            errors.push('Dirección requerida');
            isValid = false;
        }

        if (!neighborhood.value.trim()) {
            neighborhood.classList.add('error');
            errors.push('Barrio requerido');
            isValid = false;
        }

        if (!city.value.trim()) {
            city.classList.add('error');
            errors.push('Ciudad requerida');
            isValid = false;
        }
    }

    const termsAccept = document.getElementById('termsAccept');
    if (!termsAccept.checked) {
        errors.push('Debes aceptar los Términos y Condiciones');
        isValid = false;
    }

    const cesionAccept = document.getElementById('cesionAccept');
    if (!cesionAccept.checked) {
        errors.push('Debes autorizar el tratamiento de datos');
        isValid = false;
    }

    if (!isValid) {
        showToast('Por favor completa todos los campos correctamente:\n' + errors.join('\n'), 'error');
    }

    return isValid;
}

// ===== WHATSAPP =====

/**
 * Envía el pedido por WhatsApp
 */
function sendToWhatsApp() {
    if (!validateCheckoutForm()) {
        return;
    }

    const formData = collectFormData();
    const subtotal = window.getCartTotal ? window.getCartTotal() : 0;

    let message = '🛒 *PEDIDO IMOLARTE*\n';
    message += '━━━━━━━━━━━━━━━━━━━\n\n';

    message += '👤 *CLIENTE*\n';
    message += `${formData.firstName} ${formData.lastName}\n`;
    message += `📧 ${formData.email}\n`;
    message += `📱 ${formData.phone}\n\n`;

    if (formData.delivery === 'home') {
        message += '🚚 *ENTREGA A DOMICILIO*\n';
        message += `📍 ${formData.address}\n`;
        message += `🏘️ ${formData.neighborhood}, ${formData.city}\n`;
        if (formData.notes) {
            message += `📝 ${formData.notes}\n`;
        }
    } else {
        message += '🏪 *RETIRO EN ALMACÉN*\n';
    }
    message += '\n━━━━━━━━━━━━━━━━━━━\n\n';

    message += '📦 *PRODUCTOS*\n\n';
    window.cart.forEach((item, index) => {
        message += `${index + 1}. *${item.productName}*\n`;
        message += `   ${item.collection} - ${item.code}\n`;
        message += `   Cant: ${item.quantity} × ${window.formatPrice ? window.formatPrice(item.price) : '$' + item.price}\n`;
        const subtotal = item.price * item.quantity;
        message += `   💰 ${window.formatPrice ? window.formatPrice(subtotal) : '$' + subtotal}\n\n`;
    });

    message += '━━━━━━━━━━━━━━━━━━━\n';
    message += `💵 *TOTAL: ${window.formatPrice ? window.formatPrice(subtotal) : '$' + subtotal}*\n\n`;
    message += '✅ Términos aceptados\n';
    message += '👋 ¡Gracias por tu pedido!';

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');

    setTimeout(() => {
        window.cart = [];
        if (typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }
        closeCheckoutModal();
        closeCartPage();
        showToast('¡Pedido enviado! Te contactaremos por WhatsApp.', 'success');
    }, 1000);
}

/**
 * Recopila los datos del formulario
 */
function collectFormData() {
    const countryCode = document.getElementById('countryCode').value;
    const phone = document.getElementById('phone').value;
    const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;

    return {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: countryCode + phone,
        delivery: deliveryMethod,
        address: document.getElementById('address').value.trim(),
        neighborhood: document.getElementById('neighborhood').value.trim(),
        city: document.getElementById('city').value.trim(),
        notes: document.getElementById('notes').value.trim()
    };
}

// ===== FUNCIONES PARA MOSTRAR/OCULTAR OPCIONES =====

function ocultarOpcionesWompi() {
    const opcionesWompi = document.querySelectorAll('.payment-option:not(.payment-whatsapp)');
    const divider = document.querySelector('.payment-divider');
    
    opcionesWompi.forEach(opcion => {
        opcion.style.visibility = 'hidden';
        opcion.style.height = '0';
        opcion.style.overflow = 'hidden';
        opcion.style.margin = '0';
        opcion.style.padding = '0';
    });
    
    if (divider) {
        divider.style.display = 'none';
    }
}

function ocultarOpcionWhatsApp() {
    const opcionWhatsApp = document.querySelector('.payment-whatsapp');
    const divider = document.querySelector('.payment-divider');
    
    if (opcionWhatsApp) {
        opcionWhatsApp.style.visibility = 'hidden';
        opcionWhatsApp.style.height = '0';
        opcionWhatsApp.style.overflow = 'hidden';
        opcionWhatsApp.style.margin = '0';
        opcionWhatsApp.style.padding = '0';
    }
    
    if (divider) {
        divider.style.display = 'none';
    }
}

function mostrarTodasLasOpciones() {
    const todasLasOpciones = document.querySelectorAll('.payment-option');
    const divider = document.querySelector('.payment-divider');
    
    todasLasOpciones.forEach(opcion => {
        opcion.style.visibility = 'visible';
        opcion.style.height = '';
        opcion.style.overflow = '';
        opcion.style.margin = '';
        opcion.style.padding = '';
    });
    
    if (divider) {
        divider.style.display = 'flex';
    }
}

// ===== FUNCIONES PLACEHOLDER =====
function showTermsAndConditions() {
    showInfo('Términos y condiciones - Ver documento adjunto');
}

function showCesionModal() {
    showInfo('Cesión de datos - Ver documento adjunto');
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando checkout.js...');
    
    // Botón cerrar checkout
    const closeCheckoutBtn = document.getElementById('closeCheckout');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    }

    // Formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendToWhatsApp();
        });
    }

    // Opciones de entrega
    const deliveryOptions = document.querySelectorAll('.delivery-option');
    deliveryOptions.forEach(option => {
        option.addEventListener('click', function() {
            const deliveryType = this.dataset.delivery;
            const radio = this.querySelector('input[type="radio"]');
            
            if (radio) {
                radio.checked = true;
                
                deliveryOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                const addressFields = document.getElementById('addressFields');
                if (deliveryType === 'home') {
                    addressFields.classList.add('active');
                    addressFields.querySelectorAll('input, textarea').forEach(field => {
                        if (field.id !== 'notes') {
                            field.required = true;
                        }
                    });
                    document.getElementById('summaryShipping').textContent = 'A calcular';
                } else {
                    addressFields.classList.remove('active');
                    addressFields.querySelectorAll('input, textarea').forEach(field => {
                        field.required = false;
                    });
                    document.getElementById('summaryShipping').textContent = '$0';
                }
                
                updateCheckoutSummary();
            }
        });
    });

    // Links de términos
    const showTermsLink = document.getElementById('showTerms');
    if (showTermsLink) {
        showTermsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showTermsAndConditions();
        });
    }

    const showCesionLink = document.getElementById('showCesion');
    if (showCesionLink) {
        showCesionLink.addEventListener('click', function(e) {
            e.preventDefault();
            showCesionModal();
        });
    }

    // INICIALIZAR SELECTORES DE CUMPLEAÑOS (AHORA FUNCIONA)
    initBirthdaySelectors();

    // Limpiar errores al escribir
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });

    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal && checkoutModal.classList.contains('active')) {
                closeCheckoutModal();
            }
        }
    });

    console.log('✅ checkout.js inicializado correctamente');
});

console.log('📦 checkout.js loaded v2.2 (CORREGIDO)');