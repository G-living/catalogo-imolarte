// checkout-whatsapp.js
// IMOLARTE - WhatsApp Wishlist Integration
// Registers order in Sheets first, then sends via WhatsApp
// Version: 1.0

// ===== CONFIGURATION =====

const WHATSAPP_CONFIG = {
  number: '573004257367',
  businessName: 'IMOLARTE'
};

const SHEETS_CONFIG = {
  webAppUrl: 'https://script.google.com/macros/s/AKfycbw_qPay6DfCh-xxeosxmD-tuEINf9UIPT_i_0sNg5b6GbD-zZc93ZsaxjrAoqkn_m1u/exec'
};

// ===== MAIN WHATSAPP FLOW =====

async function handleWhatsAppWishlist() {
  console.log('📱 Iniciando envío por WhatsApp...');
  
  // 1. Validate form (handled by checkout-validation.js)
  if (typeof window.validateCheckoutForm !== 'function') {
    console.error('checkout-validation.js no está cargado');
    alert('Error: Sistema de validación no disponible');
    return;
  }
  
  const isValid = window.validateCheckoutForm();
  if (!isValid) {
    console.log('⛔ Validación falló');
    return;
  }
  
  console.log('✅ Validación pasó');
  
  // 2. Show loading
  showLoadingOverlay('Registrando pedido...');
  
  try {
    // 3. Register in Google Sheets FIRST (get Cliente_ID + Pedido_ID)
    const orderData = await registerWishlistInSheets();
    
    if (!orderData || !orderData.pedidoId) {
      throw new Error('No se pudo registrar el pedido en Google Sheets');
    }
    
    console.log(`✅ Pedido registrado: ${orderData.pedidoId}`);
    console.log(`✅ Cliente ID: ${orderData.clienteId}`);
    
    // 4. Format WhatsApp message with IDs
    const message = formatWhatsAppMessage(orderData);
    
    // 5. Open WhatsApp
    hideLoadingOverlay();
    openWhatsApp(message);
    
    // 6. Show confirmation UI
    showConfirmationModal(orderData.pedidoId);
    
  } catch (error) {
    console.error('❌ Error en WhatsApp flow:', error);
    hideLoadingOverlay();
    
    // Check if it's a Sheets failure
    if (error.message.includes('Google Sheets')) {
      showServiceUnavailableError();
    } else {
      alert('Error al procesar el pedido. Por favor intenta nuevamente.');
    }
  }
}

// ===== GOOGLE SHEETS REGISTRATION =====

async function registerWishlistInSheets() {
  try {
    console.log('📊 Registrando wishlist en Google Sheets...');
    
    const subtotal = getCartTotal();
    
    // Collect form data
    const formData = {
      // Cliente
      tipoDocumento: document.getElementById('docType').value,
      numeroDocumento: document.getElementById('docNumber').value,
      nombre: document.getElementById('firstName').value,
      apellido: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      codigoPais: document.getElementById('countryCode').value,
      telefono: document.getElementById('phone').value,
      cumpleDia: document.getElementById('birthdayDay').value,
      cumpleMes: document.getElementById('birthdayMonth').value,
      
      // Entrega
      metodoEntrega: document.querySelector('input[name="delivery"]:checked').value,
      direccion: document.getElementById('address')?.value || '',
      barrio: document.getElementById('neighborhood')?.value || '',
      ciudad: document.getElementById('city')?.value || '',
      notasDireccion: document.getElementById('notes')?.value || '',
      
      // Items
      items: JSON.stringify(window.cart || []),
      
      // Totales
      subtotal: subtotal,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      totalFinal: subtotal,
      
      // Pago
      tipoPago: 'WHATSAPP_ONLY',
      notasInternas: 'Pedido vía WhatsApp - Pago pendiente'
    };
    
    // Send to Sheets
    const params = new URLSearchParams(formData);
    
    const response = await fetch(SHEETS_CONFIG.webAppUrl, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      body: params
    });
    
    if (!response.ok) {
      throw new Error('Google Sheets: Error en respuesta HTTP');
    }
    
    const text = await response.text();
    const result = JSON.parse(text);
    
    if (result.success && result.pedidoId) {
      console.log(`✅ Sheets: Pedido ${result.pedidoId} registrado`);
      return {
        pedidoId: result.pedidoId,
        clienteId: result.clienteId || 'N/A',
        subtotal: subtotal
      };
    } else {
      throw new Error('Google Sheets: No se recibió pedidoId');
    }
    
  } catch (error) {
    console.error('❌ Error en Sheets:', error);
    throw new Error('Google Sheets: ' + error.message);
  }
}

// ===== WHATSAPP MESSAGE FORMATTING =====

function formatWhatsAppMessage(orderData) {
  const formData = collectFormData();
  const items = window.cart || [];
  
  let message = `🛒 *NUEVO PEDIDO - ${WHATSAPP_CONFIG.businessName}*\n\n`;
  
  // IDs from Sheets
  message += `🆔 *ID Pedido:* ${orderData.pedidoId}\n`;
  message += `👤 *ID Cliente:* ${orderData.clienteId}\n`;
  message += `📅 *Fecha:* ${new Date().toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}\n\n`;
  
  // Cliente
  message += `👤 *CLIENTE*\n`;
  message += `📝 ${formData.tipoDocumento}: ${formData.numeroDocumento}\n`;
  message += `Nombre: ${formData.nombre} ${formData.apellido}\n`;
  message += `📧 ${formData.email}\n`;
  message += `📱 ${formData.codigoPais}${formData.telefono}\n`;
  message += `🎂 ${formData.cumpleDia} de ${formData.cumpleMes}\n\n`;
  
  // Productos
  message += `📦 *PRODUCTOS*\n`;
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.productName || item.description}\n`;
    message += `   ${item.collection} - ${item.code}\n`;
    message += `   ${item.quantity} × ${formatPrice(item.price)}\n`;
    message += `   💰 ${formatPrice(item.price * item.quantity)}\n\n`;
  });
  
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `💵 *TOTAL: ${formatPrice(orderData.subtotal)}*\n\n`;
  
  // Método de Entrega
  message += `🚚 *ENTREGA*\n`;
  if (formData.metodoEntrega === 'home') {
    message += `🏠 Entrega a Domicilio\n`;
    message += `📍 ${formData.direccion}\n`;
    message += `   ${formData.barrio}, ${formData.ciudad}\n`;
    if (formData.notasDireccion) {
      message += `📝 ${formData.notasDireccion}\n`;
    }
  } else {
    message += `🏪 Retiro en Almacén\n`;
  }
  
  message += `\n💬 *Pago pendiente - Confirmar forma de pago*`;
  
  return message;
}

// ===== WHATSAPP INTEGRATION =====

function openWhatsApp(message) {
  console.log('📱 Abriendo WhatsApp...');
  
  const url = `https://wa.me/${WHATSAPP_CONFIG.number}?text=${encodeURIComponent(message)}`;
  
  // Open in new window
  window.open(url, '_blank');
  
  console.log('✅ WhatsApp abierto');
}

// ===== CONFIRMATION MODAL =====

function showConfirmationModal(pedidoId) {
  console.log('📋 Mostrando modal de confirmación...');
  
  // Close checkout modal
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) {
    checkoutModal.classList.remove('active');
  }
  
  // Create confirmation modal
  const modal = document.createElement('div');
  modal.id = 'whatsapp-confirmation-modal';
  modal.innerHTML = `
    <div class="confirmation-overlay">
      <div class="confirmation-content">
        <div class="confirmation-icon">✅</div>
        <h2 class="confirmation-title">Pedido Registrado</h2>
        <p class="confirmation-id">ID: ${pedidoId}</p>
        <p class="confirmation-text">
          Tu pedido ha sido registrado exitosamente.<br>
          Se ha abierto WhatsApp para que puedas enviar tu lista de deseos.
        </p>
        <div class="confirmation-actions">
          <button class="btn-confirm" id="btnConfirmarEnvio">
            📱 Confirmar Envío
          </button>
          <button class="btn-cancel" id="btnCancelarEnvio">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .confirmation-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      animation: fadeIn 0.3s;
    }
    .confirmation-content {
      background: white;
      padding: 3rem 2rem;
      border-radius: 12px;
      text-align: center;
      max-width: 500px;
      animation: slideUp 0.3s;
    }
    .confirmation-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .confirmation-title {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-family: 'Playfair Display', serif;
    }
    .confirmation-id {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      font-family: 'Courier New', monospace;
    }
    .confirmation-text {
      color: #555;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .confirmation-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-confirm, .btn-cancel {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      font-family: 'Lato', sans-serif;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .btn-confirm {
      background: #27ae60;
      color: white;
    }
    .btn-confirm:hover {
      transform: translateY(-2px);
      background: #229954;
    }
    .btn-cancel {
      background: #ecf0f1;
      color: #7f8c8d;
    }
    .btn-cancel:hover {
      transform: translateY(-2px);
      background: #bdc3c7;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('btnConfirmarEnvio').addEventListener('click', function() {
    handleConfirmSend(pedidoId);
  });
  
  document.getElementById('btnCancelarEnvio').addEventListener('click', function() {
    handleCancelSend();
  });
}

// ===== CONFIRMATION ACTIONS =====

async function handleConfirmSend(pedidoId) {
  console.log('✅ Usuario confirmó envío');
  
  // Update Sheets to mark as confirmed
  try {
    const params = new URLSearchParams({
      action: 'confirmWhatsApp',
      pedidoId: pedidoId
    });
    
    await fetch(SHEETS_CONFIG.webAppUrl, {
      method: 'POST',
      body: params
    });
    
    console.log('✅ Sheets actualizado: confirmado');
  } catch (error) {
    console.error('Error actualizando confirmación:', error);
  }
  
  // Clear cart
  if (window.cart) {
    window.cart = [];
    if (typeof window.updateCartUI === 'function') {
      window.updateCartUI();
    }
  }
  
  // Show success and close
  showSuccessToast('¡Pedido confirmado! Gracias por tu compra.');
  
  setTimeout(() => {
    const modal = document.getElementById('whatsapp-confirmation-modal');
    if (modal) {
      modal.remove();
    }
  }, 500);
}

function handleCancelSend() {
  console.log('❌ Usuario canceló envío');
  
  // Just close modal, keep cart
  const modal = document.getElementById('whatsapp-confirmation-modal');
  if (modal) {
    modal.remove();
  }
  
  // Reopen checkout
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) {
    checkoutModal.classList.add('active');
  }
}

// ===== UTILITY FUNCTIONS =====

function collectFormData() {
  return {
    tipoDocumento: document.getElementById('docType').value,
    numeroDocumento: document.getElementById('docNumber').value,
    nombre: document.getElementById('firstName').value,
    apellido: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    codigoPais: document.getElementById('countryCode').value,
    telefono: document.getElementById('phone').value,
    cumpleDia: document.getElementById('birthdayDay').value,
    cumpleMes: document.getElementById('birthdayMonth').value,
    metodoEntrega: document.querySelector('input[name="delivery"]:checked').value,
    direccion: document.getElementById('address')?.value || '',
    barrio: document.getElementById('neighborhood')?.value || '',
    ciudad: document.getElementById('city')?.value || '',
    notasDireccion: document.getElementById('notes')?.value || ''
  };
}

function getCartTotal() {
  if (!window.cart || !Array.isArray(window.cart)) {
    return 0;
  }
  return window.cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

function formatPrice(price) {
  return '$' + Math.round(price).toLocaleString('es-CO');
}

// ===== UI HELPERS =====

function showLoadingOverlay(message) {
  let overlay = document.getElementById('whatsapp-loading-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'whatsapp-loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="spinner"></div>
        <p class="loading-message">${message}</p>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      #whatsapp-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
      }
      #whatsapp-loading-overlay .loading-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        min-width: 300px;
      }
      #whatsapp-loading-overlay .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #25D366;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      #whatsapp-loading-overlay .loading-message {
        font-family: 'Lato', sans-serif;
        color: #2c3e50;
        margin: 0;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
  } else {
    overlay.style.display = 'flex';
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('whatsapp-loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 100000;
    font-family: 'Lato', sans-serif;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function showServiceUnavailableError() {
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: 'Lato', sans-serif;
    ">
      <div style="
        background: white;
        padding: 3rem;
        border-radius: 12px;
        text-align: center;
        max-width: 500px;
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
        <h2 style="color: #e74c3c; margin-bottom: 1rem;">Actualmente Fuera de Servicio</h2>
        <p style="color: #7f8c8d; margin-bottom: 2rem;">
          Nuestro sistema está experimentando dificultades técnicas. 
          Por favor intenta nuevamente en unos minutos.
        </p>
        <button onclick="location.reload()" style="
          background: #c9a961;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
        ">Reintentar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.body.style.pointerEvents = 'none';
  overlay.style.pointerEvents = 'all';
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 checkout-whatsapp.js cargado');
  
  // Attach to WhatsApp button
  const btnWhatsApp = document.getElementById('btnWhatsApp');
  
  if (btnWhatsApp) {
    btnWhatsApp.addEventListener('click', handleWhatsAppWishlist);
    console.log('✅ Botón WhatsApp conectado');
  } else {
    console.warn('⚠️ btnWhatsApp no encontrado');
  }
});

// Export for other modules
window.handleWhatsAppWishlist = handleWhatsAppWishlist;

console.log('📦 checkout-whatsapp.js loaded v1.0');
