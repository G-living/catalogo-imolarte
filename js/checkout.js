/**
 * ================================================================
 * IMOLARTE - CHECKOUT DEFINITIVO
 * ================================================================
 * Sistema completo de checkout con:
 * - Flujos separados (Pago en línea vs WhatsApp)
 * - Integración con Google Sheets
 * - Gestión de timer de carrito
 * - Validación completa
 * Versión: 3.0 DEFINITIVA
 * ================================================================
 */

// ===== VARIABLES GLOBALES =====

let checkoutModal = null;
let currentPaymentMethod = 'online'; // 'online' o 'whatsapp'

// ===== HTML DEL MODAL DE CHECKOUT =====

const CHECKOUT_MODAL_HTML = `
<div id="checkoutModal" class="modal">
  <div class="modal-content checkout-modal-content">
    <button class="modal-close" id="closeCheckoutBtn">×</button>
    
    <div class="checkout-container">
      <h2>Finalizar Pedido</h2>
      
      <!-- FORMULARIO DE DATOS -->
      <form id="checkoutForm" class="checkout-form">
        <!-- Datos personales -->
        <div class="form-section">
          <h3>Datos Personales</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="docType">Tipo de Documento *</label>
              <select id="docType" required>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="NIT">NIT</option>
                <option value="PP">Pasaporte</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="docNumber">Número de Documento *</label>
              <input type="text" id="docNumber" required pattern="[0-9]+">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Nombre *</label>
              <input type="text" id="firstName" required>
            </div>
            
            <div class="form-group">
              <label for="lastName">Apellido *</label>
              <input type="text" id="lastName" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email *</label>
              <input type="email" id="email" required>
            </div>
            
            <div class="form-group">
              <label for="phone">Teléfono *</label>
              <div class="phone-input">
                <select id="countryCode">
                  <option value="+57">🇨🇴 +57</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+34">🇪🇸 +34</option>
                </select>
                <input type="tel" id="phone" required pattern="[0-9]{10}">
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Cumpleaños *</label>
              <div class="birthday-input">
                <input type="number" id="birthdayDay" min="1" max="31" placeholder="Día" required>
                <select id="birthdayMonth" required>
                  <option value="">Mes</option>
                  <option value="Enero">Enero</option>
                  <option value="Febrero">Febrero</option>
                  <option value="Marzo">Marzo</option>
                  <option value="Abril">Abril</option>
                  <option value="Mayo">Mayo</option>
                  <option value="Junio">Junio</option>
                  <option value="Julio">Julio</option>
                  <option value="Agosto">Agosto</option>
                  <option value="Septiembre">Septiembre</option>
                  <option value="Octubre">Octubre</option>
                  <option value="Noviembre">Noviembre</option>
                  <option value="Diciembre">Diciembre</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Método de entrega (SIEMPRE VISIBLE) -->
        <div class="form-section">
          <h3>Método de Entrega</h3>
          
          <div class="delivery-options">
            <label class="delivery-option">
              <input type="radio" name="delivery" value="home" checked>
              <span>🏠 Entrega a domicilio</span>
            </label>
            
            <label class="delivery-option">
              <input type="radio" name="delivery" value="pickup">
              <span>🏪 Retiro en almacén</span>
            </label>
          </div>
          
          <div id="deliveryFields" class="delivery-fields">
            <div class="form-group">
              <label for="address">Dirección *</label>
              <input type="text" id="address" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="neighborhood">Barrio *</label>
                <input type="text" id="neighborhood" required>
              </div>
              
              <div class="form-group">
                <label for="city">Ciudad *</label>
                <input type="text" id="city" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="notes">Notas de entrega (opcional)</label>
              <textarea id="notes" rows="3"></textarea>
            </div>
          </div>
        </div>
        
        <!-- Términos y condiciones -->
        <div class="form-section">
          <label class="checkbox-label">
            <input type="checkbox" id="termsAccepted" required>
            <span>Acepto el tratamiento de datos personales (<a href="#" target="_blank">Ley 1581 de 2012</a>) *</span>
          </label>
          
          <label class="checkbox-label">
            <input type="checkbox" id="tcAccepted" required>
            <span>Acepto los <a href="#" target="_blank">Términos y Condiciones</a> *</span>
          </label>
        </div>
      </form>
      
      <!-- RESUMEN DEL PEDIDO -->
      <div class="order-summary">
        <h3>Resumen del Pedido</h3>
        <div id="orderSummaryItems" class="summary-items"></div>
        <div class="summary-totals">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span id="summarySubtotal">$0</span>
          </div>
          <div class="summary-line discount" id="summaryDiscountLine" style="display: none;">
            <span>Descuento (3%):</span>
            <span id="summaryDiscount">-$0</span>
          </div>
          <div class="summary-line total">
            <span>Total:</span>
            <span id="summaryTotal">$0</span>
          </div>
        </div>
      </div>
      
      <!-- ELEGIR FORMA DE PAGO/CONFIRMACIÓN -->
      <div class="payment-method-selector">
        <h3>¿Cómo deseas confirmar tu pedido?</h3>
        
        <div class="payment-options-grid">
          <label class="payment-option-card">
            <input type="radio" name="paymentMethod" value="online" checked>
            <div class="option-content">
              <div class="option-icon">💳</div>
              <div class="option-text">
                <strong>Pagar en línea</strong>
                <small>Con tarjeta, PSE o Nequi (Wompi)</small>
              </div>
            </div>
          </label>
          
          <label class="payment-option-card">
            <input type="radio" name="paymentMethod" value="whatsapp">
            <div class="option-content">
              <div class="option-icon">💬</div>
              <div class="option-text">
                <strong>Coordinar por WhatsApp</strong>
                <small>Confirma disponibilidad y forma de pago</small>
              </div>
            </div>
          </label>
        </div>
      </div>
      
      <!-- OPCIONES DE PAGO EN LÍNEA (mostrar si elige "online") -->
      <div id="onlinePaymentOptions" class="payment-options-section">
        <h3>Elige tu opción de pago</h3>
        
        <div class="payment-choice">
          <div class="payment-card">
            <div class="payment-header">
              <span class="payment-icon">💰</span>
              <div>
                <strong>Pagar Anticipo (60%)</strong>
                <small>Paga el 60% ahora, el resto al recibir</small>
              </div>
            </div>
            <div class="payment-amount" id="anticipoAmount">$0</div>
            <button type="button" class="btn-payment btn-anticipo" onclick="handlePagarAnticipo()">
              💳 Pagar Anticipo
            </button>
          </div>
          
          <div class="payment-card highlight">
            <div class="badge-discount">Ahorra 3%</div>
            <div class="payment-header">
              <span class="payment-icon">✨</span>
              <div>
                <strong>Pago Completo Anticipado</strong>
                <small>Paga todo ahora y obtén 3% de descuento</small>
              </div>
            </div>
            <div class="payment-savings">
              <span>Ahorras:</span>
              <span id="savingsAmount">$0</span>
            </div>
            <div class="payment-amount" id="fullAmount">$0</div>
            <button type="button" class="btn-payment btn-full" onclick="handlePagarCompleto()">
              💎 Pagar 100% Ahora
            </button>
          </div>
        </div>
      </div>
      
      <!-- BOTÓN WHATSAPP (mostrar si elige "whatsapp") -->
      <div id="whatsappOption" class="whatsapp-section" style="display: none;">
        <div class="whatsapp-card">
          <div class="whatsapp-icon">📱</div>
          <div class="whatsapp-text">
            <h4>Enviar pedido por WhatsApp</h4>
            <p>Te enviaremos el detalle completo de tu pedido para que confirmes disponibilidad y coordines la forma de pago.</p>
          </div>
          <button type="button" class="btn-whatsapp" onclick="handleEnviarWhatsApp()">
            💬 Enviar Pedido
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`;

// ===== ABRIR/CERRAR MODAL =====

/**
 * Abre el modal de checkout
 */
function openCheckoutModal() {
  if (cart.length === 0) {
    alert('El carrito está vacío');
    return;
  }
  
  // Crear modal si no existe
  if (!document.getElementById('checkoutModal')) {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = CHECKOUT_MODAL_HTML;
    document.body.appendChild(modalContainer.firstElementChild);
  }
  
  checkoutModal = document.getElementById('checkoutModal');
  checkoutModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Inicializar
  initCheckoutListeners();
  actualizarResumenPedido();
  
  console.log('✅ Modal de checkout abierto');
}

/**
 * Cierra el modal de checkout
 */
function closeCheckoutModal() {
  if (checkoutModal) {
    checkoutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// ===== INICIALIZACIÓN DE LISTENERS =====

/**
 * Inicializa todos los event listeners del checkout
 */
function initCheckoutListeners() {
  // Botón cerrar (X)
  const closeBtn = document.getElementById('closeCheckoutBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCheckoutModal);
  }
  
  // Cambio de método de pago
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', handlePaymentMethodChange);
  });
  
  // Cambio de método de entrega
  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', handleDeliveryMethodChange);
  });
  
  // Trigger inicial
  handlePaymentMethodChange({ target: { value: 'online' } });
  handleDeliveryMethodChange({ target: { value: 'home' } });
}

/**
 * Maneja cambio de método de pago
 */
function handlePaymentMethodChange(e) {
  currentPaymentMethod = e.target.value;
  
  const onlineOptions = document.getElementById('onlinePaymentOptions');
  const whatsappOption = document.getElementById('whatsappOption');
  
  if (currentPaymentMethod === 'online') {
    onlineOptions.style.display = 'block';
    whatsappOption.style.display = 'none';
    actualizarResumenPedido(true); // Con descuento
  } else {
    onlineOptions.style.display = 'none';
    whatsappOption.style.display = 'block';
    actualizarResumenPedido(false); // Sin descuento
  }
}

/**
 * Maneja cambio de método de entrega
 */
function handleDeliveryMethodChange(e) {
  const esDomicilio = e.target.value === 'home';
  const deliveryFields = document.getElementById('deliveryFields');
  
  if (esDomicilio) {
    deliveryFields.style.display = 'block';
    document.getElementById('address').required = true;
    document.getElementById('neighborhood').required = true;
    document.getElementById('city').required = true;
  } else {
    deliveryFields.style.display = 'none';
    document.getElementById('address').required = false;
    document.getElementById('neighborhood').required = false;
    document.getElementById('city').required = false;
  }
}

// ===== ACTUALIZAR RESUMEN =====

/**
 * Actualiza el resumen del pedido
 */
function actualizarResumenPedido(mostrarDescuento = false) {
  const subtotal = getCartTotal();
  const descuento = mostrarDescuento ? Math.round(subtotal * 0.03) : 0;
  const total = subtotal - descuento;
  const anticipo = Math.round(total * 0.60);
  
  // Items
  const itemsContainer = document.getElementById('orderSummaryItems');
  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div class="summary-item">
        <span>${item.quantity}× ${item.description} (${item.collection})</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');
  }
  
  // Totales
  const subtotalEl = document.getElementById('summarySubtotal');
  const totalEl = document.getElementById('summaryTotal');
  const discountLine = document.getElementById('summaryDiscountLine');
  const discountEl = document.getElementById('summaryDiscount');
  
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(total);
  
  if (discountLine && discountEl) {
    if (mostrarDescuento && descuento > 0) {
      discountEl.textContent = '-' + formatPrice(descuento);
      discountLine.style.display = 'flex';
    } else {
      discountLine.style.display = 'none';
    }
  }
  
  // Montos de pago
  const anticipoEl = document.getElementById('anticipoAmount');
  const fullEl = document.getElementById('fullAmount');
  const savingsEl = document.getElementById('savingsAmount');
  
  if (anticipoEl) anticipoEl.textContent = formatPrice(anticipo);
  if (fullEl) fullEl.textContent = formatPrice(total);
  if (savingsEl) savingsEl.textContent = formatPrice(descuento);
}

// ===== VALIDACIÓN DE FORMULARIO =====

/**
 * Valida el formulario de checkout
 */
function validarFormulario() {
  const form = document.getElementById('checkoutForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }
  
  // Validaciones adicionales
  const termsAccepted = document.getElementById('termsAccepted').checked;
  const tcAccepted = document.getElementById('tcAccepted').checked;
  
  if (!termsAccepted || !tcAccepted) {
    alert('Debes aceptar los términos y condiciones');
    return false;
  }
  
  return true;
}

// ===== HANDLERS DE BOTONES =====

/**
 * Handler: Pagar anticipo 60%
 */
function handlePagarAnticipo() {
  if (!validarFormulario()) return;
  
  console.log('💳 Pagar anticipo 60%');
  
  // TODO: Integrar Wompi
  enviarPedidoConSheets('ANTICIPO_60');
}

/**
 * Handler: Pagar completo con descuento
 */
function handlePagarCompleto() {
  if (!validarFormulario()) return;
  
  console.log('💎 Pagar completo 100%');
  
  // TODO: Integrar Wompi
  enviarPedidoConSheets('PAGO_100');
}

/**
 * Handler: Enviar por WhatsApp
 */
function handleEnviarWhatsApp() {
  if (!validarFormulario()) return;
  
  console.log('💬 Enviar por WhatsApp');
  
  enviarPedidoConSheets('WHATSAPP_ONLY');
}

// ===== INTEGRACIÓN CON GOOGLE SHEETS =====

/**
 * Envía pedido a Google Sheets y abre WhatsApp
 */
async function enviarPedidoConSheets(tipoPago) {
  // Recopilar datos
  const datosPedido = recopilarDatosPedido(tipoPago);
  
  // Mostrar loading
  mostrarLoading('Registrando pedido...');
  
  try {
    // Enviar a Sheets (función de google-sheets-integration.js)
    const resultado = await enviarPedidoASheets(datosPedido);
    
    if (resultado.success && resultado.pedidoId) {
      console.log('✅ Pedido registrado:', resultado.pedidoId);
      
      // Enviar WhatsApp
      enviarWhatsApp(datosPedido, resultado.pedidoId);
      
      // Notificación
      mostrarNotificacion(`✅ Pedido ${resultado.pedidoId} registrado`);
      
      // Limpiar carrito y cerrar modal
      setTimeout(() => {
        if (typeof limpiarCarritoCompletamente === 'function') {
          limpiarCarritoCompletamente();
        } else {
          cart = [];
          updateCartUI();
        }
        closeCheckoutModal();
      }, 1500);
      
    } else {
      // Fallback: ID temporal
      console.warn('⚠️ Sin ID de Sheets, usando temporal');
      const idTemporal = generarIdTemporal();
      enviarWhatsApp(datosPedido, idTemporal);
      mostrarNotificacion('⚠️ Pedido enviado - verificar Sheets');
      
      setTimeout(() => {
        closeCheckoutModal();
      }, 1500);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    const idTemporal = generarIdTemporal();
    enviarWhatsApp(datosPedido, idTemporal);
    mostrarNotificacion('⚠️ Error - pedido enviado por WhatsApp');
    
    setTimeout(() => {
      closeCheckoutModal();
    }, 1500);
  } finally {
    ocultarLoading();
  }
}

/**
 * Recopila datos del formulario
 */
function recopilarDatosPedido(tipoPago) {
  const tipoDoc = document.getElementById('docType').value;
  const numDoc = document.getElementById('docNumber').value;
  const nombre = document.getElementById('firstName').value;
  const apellido = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const codigoPais = document.getElementById('countryCode').value;
  const telefono = document.getElementById('phone').value;
  const cumpleDia = document.getElementById('birthdayDay').value;
  const cumpleMes = document.getElementById('birthdayMonth').value;
  
  const metodoEntrega = document.querySelector('input[name="delivery"]:checked').value;
  const esDomicilio = metodoEntrega === 'home';
  
  const direccion = esDomicilio ? document.getElementById('address').value : '';
  const barrio = esDomicilio ? document.getElementById('neighborhood').value : '';
  const ciudad = esDomicilio ? document.getElementById('city').value : '';
  const notasEntrega = esDomicilio ? (document.getElementById('notes').value || '') : '';
  
  const subtotal = getCartTotal();
  let descuentoPorcentaje = 0;
  let descuentoMonto = 0;
  let totalFinal = subtotal;
  
  if (tipoPago === 'PAGO_100') {
    descuentoPorcentaje = 3;
    descuentoMonto = Math.round(subtotal * 0.03);
    totalFinal = subtotal - descuentoMonto;
  }
  
  const items = cart.map(item => ({
    producto: item.description,
    coleccion: item.collection,
    codigo: item.code,
    cantidad: item.quantity,
    precio: item.price,
    subtotal: item.price * item.quantity
  }));
  
  return {
    cliente: {
      tipoDocumento: tipoDoc,
      numeroDocumento: numDoc,
      nombre: nombre,
      apellido: apellido,
      email: email,
      codigoPais: codigoPais,
      telefono: telefono,
      cumpleDia: parseInt(cumpleDia),
      cumpleMes: cumpleMes,
      direccion: direccion,
      barrio: barrio,
      ciudad: ciudad,
      notasDireccion: notasEntrega
    },
    items: items,
    subtotal: subtotal,
    descuentoPorcentaje: descuentoPorcentaje,
    descuentoMonto: descuentoMonto,
    totalFinal: totalFinal,
    metodoEntrega: esDomicilio ? 'DOMICILIO' : 'RETIRO',
    notasEntrega: notasEntrega,
    tipoPago: tipoPago,
    notasInternas: `Método: ${currentPaymentMethod === 'online' ? 'Pago en línea' : 'WhatsApp'}`
  };
}

/**
 * Genera mensaje de WhatsApp
 */
function enviarWhatsApp(datosPedido, pedidoId) {
  const { cliente, items, subtotal, descuentoMonto, totalFinal, metodoEntrega, tipoPago } = datosPedido;
  
  let mensaje = '🛒 *NUEVO PEDIDO - IMOLARTE*\n\n';
  mensaje += `🆔 *ID Pedido:* ${pedidoId}\n`;
  mensaje += `📅 Fecha: ${new Date().toLocaleDateString('es-CO')}\n\n`;
  
  mensaje += '👤 *CLIENTE*\n';
  mensaje += `📝 ${cliente.tipoDocumento}: ${cliente.numeroDocumento}\n`;
  mensaje += `Nombre: ${cliente.nombre} ${cliente.apellido}\n`;
  mensaje += `📧 ${cliente.email}\n`;
  mensaje += `📱 ${cliente.codigoPais}${cliente.telefono}\n`;
  mensaje += `🎂 ${cliente.cumpleDia} de ${cliente.cumpleMes}\n\n`;
  
  mensaje += '📦 *PRODUCTOS*\n';
  mensaje += '━━━━━━━━━━━━━━━━━━\n';
  
  items.forEach((item, i) => {
    mensaje += `${i + 1}. ${item.producto}\n`;
    mensaje += `   ${item.coleccion} - ${item.codigo}\n`;
    mensaje += `   ${item.cantidad} × ${formatPrice(item.precio)}\n`;
    mensaje += `   💰 ${formatPrice(item.subtotal)}\n\n`;
  });
  
  mensaje += '━━━━━━━━━━━━━━━━━━\n';
  mensaje += `💵 Subtotal: ${formatPrice(subtotal)}\n`;
  
  if (descuentoMonto > 0) {
    mensaje += `🎉 Descuento (3%): -${formatPrice(descuentoMonto)}\n`;
  }
  
  mensaje += `💰 *TOTAL: ${formatPrice(totalFinal)}*\n\n`;
  
  if (tipoPago === 'PAGO_100') {
    mensaje += `✨ *PAGO COMPLETO*\n`;
    mensaje += `Con descuento del 3%\n`;
    mensaje += `A pagar: ${formatPrice(totalFinal)}\n\n`;
  } else if (tipoPago === 'ANTICIPO_60') {
    const anticipo = Math.round(totalFinal * 0.60);
    const saldo = totalFinal - anticipo;
    mensaje += `📊 *ANTICIPO (60%)*: ${formatPrice(anticipo)}\n`;
    mensaje += `Saldo (40%): ${formatPrice(saldo)}\n`;
    mensaje += `💡 Saldo al recibir\n\n`;
  } else {
    mensaje += `💬 *SOLICITUD DE PEDIDO*\n`;
    mensaje += `Confirmar disponibilidad y coordinar forma de pago\n\n`;
  }
  
  mensaje += `🚚 *ENTREGA*\n`;
  if (metodoEntrega === 'DOMICILIO') {
    mensaje += `🏠 ${cliente.direccion}\n`;
    mensaje += `   ${cliente.barrio}, ${cliente.ciudad}\n`;
    if (cliente.notasDireccion) {
      mensaje += `📝 ${cliente.notasDireccion}\n`;
    }
  } else {
    mensaje += `🏪 Retiro en almacén\n`;
  }
  
  const url = `https://wa.me/573004257367?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

/**
 * Genera ID temporal
 */
function generarIdTemporal() {
  const now = new Date();
  const año = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const hora = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const seg = String(now.getSeconds()).padStart(2, '0');
  
  return `IMO-${año}${mes}${dia}-${hora}${min}${seg}`;
}

// ===== UI HELPERS =====

/**
 * Muestra loading overlay
 */
function mostrarLoading(mensaje = 'Procesando...') {
  const loading = document.createElement('div');
  loading.id = 'loading-overlay';
  loading.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #c9a961;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <p style="
          font-family: 'Lato', sans-serif;
          font-size: 1.1rem;
          color: #2c3e50;
          margin: 0;
        ">${mensaje}</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(loading);
}

/**
 * Oculta loading overlay
 */
function ocultarLoading() {
  const loading = document.getElementById('loading-overlay');
  if (loading) loading.remove();
}

/**
 * Muestra notificación
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
  const colores = {
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c'
  };
  
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${colores[tipo] || colores.success};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 100000;
    font-family: 'Lato', sans-serif;
    font-size: 0.95rem;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// ===== EXPORTAR FUNCIONES =====

window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.handlePagarAnticipo = handlePagarAnticipo;
window.handlePagarCompleto = handlePagarCompleto;
window.handleEnviarWhatsApp = handleEnviarWhatsApp;

console.log('✅ Checkout DEFINITIVO v3.0 cargado');
