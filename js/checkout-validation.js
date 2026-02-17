// checkout-validation.js
// IMOLARTE - Checkout Form Validation
// Validates 10 mandatory fields with inline error messages
// Version: 1.0

/**
 * Validates entire checkout form
 * Returns true if valid, false if errors (and shows them inline)
 */
function validateForm() {
  console.log('🔍 Starting form validation...');
  
  // Clear all previous errors
  clearErrors();
  
  let isValid = true;
  
  // 1. Validate Nombre(s)
  const firstName = document.getElementById('firstName');
  if (!firstName.value.trim()) {
    showError('firstName', 'Por favor ingrese su nombre');
    isValid = false;
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(firstName.value)) {
    showError('firstName', 'Solo letras permitidas');
    isValid = false;
  }
  
  // 2. Validate Apellido(s)
  const lastName = document.getElementById('lastName');
  if (!lastName.value.trim()) {
    showError('lastName', 'Por favor ingrese su apellido');
    isValid = false;
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(lastName.value)) {
    showError('lastName', 'Solo letras permitidas');
    isValid = false;
  }
  
  // 3. Validate Tipo de documento
  const docType = document.getElementById('docType');
  if (!docType.value || docType.value === '') {
    showError('docType', 'Seleccione tipo de documento');
    isValid = false;
  }
  
  // 4. Validate Número de identificación
  const docNumber = document.getElementById('docNumber');
  const docTypeVal = docType.value;
  const docNumVal = docNumber.value.trim();
  
  if (!docNumVal) {
    showError('docNumber', 'Ingrese número de documento');
    isValid = false;
  } else if (!/^[0-9]+$/.test(docNumVal)) {
    showError('docNumber', 'Solo números permitidos');
    isValid = false;
  } else {
    // Validate length based on document type
    let minLen = 6, maxLen = 12;
    if (docTypeVal === 'CC') { 
      minLen = 6; 
      maxLen = 12; 
    } else if (docTypeVal === 'CE') { 
      minLen = 5; 
      maxLen = 15; 
    } else if (docTypeVal === 'NIT') { 
      minLen = 9; 
      maxLen = 12; 
    }
    
    if (docNumVal.length < minLen || docNumVal.length > maxLen) {
      showError('docNumber', `El número debe tener entre ${minLen} y ${maxLen} dígitos para ${docTypeVal}`);
      isValid = false;
    }
  }
  
  // 5. Validate Fecha de cumpleaños (día y mes)
  const birthdayDay = document.getElementById('birthdayDay');
  const birthdayMonth = document.getElementById('birthdayMonth');
  
  if (!birthdayDay.value || birthdayDay.value === '' || !birthdayMonth.value || birthdayMonth.value === '') {
    showError('birthdayDay', 'Seleccione día y mes de cumpleaños');
    isValid = false;
  }
  
  // 6. Validate Email
  const email = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    showError('email', 'Ingrese su email');
    isValid = false;
  } else if (!emailRegex.test(email.value)) {
    showError('email', 'Email inválido');
    isValid = false;
  }
  
  // 6b. Validate Email Confirmation (if field exists)
  const emailConfirm = document.getElementById('emailConfirm');
  if (emailConfirm) {
    if (!emailConfirm.value.trim()) {
      showError('emailConfirm', 'Confirme su email');
      isValid = false;
    } else if (emailConfirm.value !== email.value) {
      showError('emailConfirm', 'Los correos no coinciden');
      isValid = false;
    }
  }
  
  // 7. Validate Celular/WhatsApp
  const phone = document.getElementById('phone');
  const phoneVal = phone.value.replace(/\D/g, ''); // Remove non-digits
  
  if (!phoneVal) {
    showError('phone', 'Ingrese su número de celular');
    isValid = false;
  } else if (phoneVal.length !== 10 || !phoneVal.startsWith('3')) {
    showError('phone', 'Debe ser un celular colombiano válido (10 dígitos, inicia con 3)');
    isValid = false;
  }
  
  // 8. Validate Método de Entrega
  const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
  if (!deliveryMethod) {
    showError('deliveryOptions', 'Por favor escoja una opción de entrega');
    
    // Add shake animation
    const deliveryContainer = document.getElementById('deliveryOptionsContainer');
    if (deliveryContainer) {
      deliveryContainer.classList.add('shake');
      setTimeout(() => {
        deliveryContainer.classList.remove('shake');
      }, 300);
    }
    
    isValid = false;
  }
  
  // 9. Validate Términos y Condiciones
  const termsAccept = document.getElementById('termsAccept');
  if (!termsAccept.checked) {
    showError('termsAccept', 'Debe aceptar los Términos y Condiciones');
    isValid = false;
  }
  
  // 10. Validate Cesión de datos
  const cesionAccept = document.getElementById('cesionAccept');
  if (!cesionAccept.checked) {
    showError('cesionAccept', 'Debe autorizar el tratamiento de datos');
    isValid = false;
  }
  
  // Log result
  if (isValid) {
    console.log('✅ Validación exitosa - formulario completo');
  } else {
    console.log('❌ Validación fallida - errores encontrados');
  }
  
  return isValid;
}

/**
 * Shows inline error message for a field
 * @param {string} fieldId - ID of the field
 * @param {string} message - Error message to display
 */
function showError(fieldId, message) {
  const errorSpan = document.getElementById(`${fieldId}-error`);
  
  if (errorSpan) {
    errorSpan.textContent = message;
    errorSpan.classList.remove('hidden');
    
    // Also highlight the input field
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add('input-error');
      // Focus the field for accessibility (helps keyboard users)
      field.focus();
      // Set aria-invalid for screen readers
      field.setAttribute('aria-invalid', 'true');
    }
  } else {
    console.warn(`Error span not found: ${fieldId}-error`);
  }
}

/**
 * Clears all error messages
 */
function clearErrors() {
  // Clear all error spans
  const errorSpans = document.querySelectorAll('.error-message');
  errorSpans.forEach(span => {
    span.textContent = '';
    span.classList.add('hidden');
  });
  
  // Remove error highlighting from inputs and aria attributes
  const errorInputs = document.querySelectorAll('.input-error');
  errorInputs.forEach(input => {
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
  });
  
  console.log('🧹 Errores limpiados');
}

/**
 * Clears error for a specific field (useful for real-time validation)
 * @param {string} fieldId - ID of the field
 */
function clearFieldError(fieldId) {
  const errorSpan = document.getElementById(`${fieldId}-error`);
  if (errorSpan) {
    errorSpan.textContent = '';
    errorSpan.classList.add('hidden');
  }
  
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.remove('input-error');
    // Remove aria-invalid for screen readers
    field.removeAttribute('aria-invalid');
  }
}

/**
 * Initialize validation listeners
 */
function initValidation() {
  console.log('🔧 Inicializando validación de checkout...');
  
  // Attach validation to payment buttons
  const btnAnticipo = document.getElementById('btnAnticipo');
  const btnPagoCompleto = document.getElementById('btnPagoCompleto');
  const btnWhatsApp = document.getElementById('btnWhatsApp');
  
  // Store original click handlers
  const buttons = [
    { element: btnAnticipo, name: 'Anticipo' },
    { element: btnPagoCompleto, name: 'Pago Completo' },
    { element: btnWhatsApp, name: 'WhatsApp' }
  ];
  
  buttons.forEach(button => {
    if (button.element) {
      // Add validation before any existing handlers
      button.element.addEventListener('click', function(e) {
        console.log(`🔘 Click en botón: ${button.name}`);
        
        // Run validation
        const isValid = validateForm();
        
        if (!isValid) {
          e.preventDefault();
          e.stopImmediatePropagation();
          console.log('⛔ Validación falló - acción cancelada');
          return false;
        }
        
        console.log('✅ Validación pasó - continuando...');
        // If valid, let the event continue to other handlers
      }, true); // Use capture phase to run first
      
      console.log(`✅ Validación agregada a: ${button.name}`);
    } else {
      console.warn(`⚠️ Botón no encontrado: ${button.name}`);
    }
  });
  
  // Special: Watch cesionAccept for delivery validation
  const cesionAccept = document.getElementById('cesionAccept');
  if (cesionAccept) {
    cesionAccept.addEventListener('change', function() {
      if (this.checked) {
        // Check if delivery is selected
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
        if (!deliveryMethod) {
          showError('deliveryOptions', 'Por favor escoja una opción de entrega');
        }
      }
    });
  }
  
  // Clear delivery error when a delivery option is selected
  const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      clearFieldError('deliveryOptions');
    });
  });
  
  // Optional: Clear errors on input (real-time feedback)
  setupRealTimeValidation();
  
  console.log('✅ Validación de checkout inicializada');
}

/**
 * Setup real-time validation (clears errors as user types)
 */
function setupRealTimeValidation() {
  const fields = [
    'firstName',
    'lastName',
    'docType',
    'docNumber',
    'birthdayDay',
    'birthdayMonth',
    'email',
    'emailConfirm',
    'phone'
  ];
  
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', function() {
        clearFieldError(fieldId);
      });
      
      field.addEventListener('change', function() {
        clearFieldError(fieldId);
      });
    }
  });
  
  // For checkboxes
  const termsAccept = document.getElementById('termsAccept');
  const cesionAccept = document.getElementById('cesionAccept');
  
  if (termsAccept) {
    termsAccept.addEventListener('change', function() {
      clearFieldError('termsAccept');
    });
  }
  
  if (cesionAccept) {
    cesionAccept.addEventListener('change', function() {
      clearFieldError('cesionAccept');
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidation);
} else {
  initValidation();
}

// Export functions for use by other modules
window.validateCheckoutForm = validateForm;
window.clearCheckoutErrors = clearErrors;

console.log('📦 checkout-validation.js cargado');
