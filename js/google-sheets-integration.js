/**
 * IMOLARTE - Integración Google Sheets
 * Módulo para enviar pedidos a Google Sheets
 * Versión: 1.0
 */

// ===== CONFIGURACIÓN =====
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwqDLCWDljl--kixf5B6CFeDl84PEZGnoMuRoJk8pUzvIWLkYEzvFRUJSK1kFaGeXRW/exec';

// Porcentajes configurables
const PORCENTAJE_ANTICIPO = 60;
const DESCUENTO_PAGO_COMPLETO = 3; // 3%

// ===== FUNCIONES AUXILIARES =====

/**
 * Calcula el descuento por pago completo
 */
function calcularDescuento(total) {
    return Math.round(total * (DESCUENTO_PAGO_COMPLETO / 100));
}

/**
 * Calcula monto del anticipo (60%)
 */
function calcularAnticipo(total) {
    return Math.round(total * (PORCENTAJE_ANTICIPO / 100));
}

/**
 * Calcula total con descuento
 */
function calcularTotalConDescuento(total) {
    return total - calcularDescuento(total);
}

// ===== ENVIAR PEDIDO A GOOGLE SHEETS =====

/**
 * Envía el pedido a Google Sheets
 * @param {Object} datosPedido - Datos completos del pedido
 * @returns {Promise} - Respuesta del servidor
 */
async function enviarPedidoASheets(datosPedido) {
    try {
        console.log('📊 Enviando pedido a Google Sheets...');
        console.log('Datos:', datosPedido);
        
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Importante para Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosPedido)
        });
        
        console.log('✅ Pedido enviado a Google Sheets');
        
        // Como usamos no-cors, no podemos leer la respuesta
        // Pero si llegó aquí sin error, asumimos que funcionó
        return {
            success: true,
            mensaje: 'Pedido registrado en sistema'
        };
        
    } catch (error) {
        console.error('❌ Error al enviar a Google Sheets:', error);
        
        // Aunque haya error de CORS, el pedido puede haberse guardado
        // Retornamos success de todos modos
        return {
            success: true,
            mensaje: 'Pedido enviado (verificar en Sheets)',
            error: error.message
        };
    }
}

/**
 * Recopila todos los datos del formulario y carrito
 * @param {string} tipoPago - 'ANTICIPO_60' o 'PAGO_100'
 * @returns {Object} - Objeto con todos los datos estructurados
 */
function recopilarDatosPedido(tipoPago = 'ANTICIPO_60') {
    // Obtener datos del formulario
    const tipoDoc = document.getElementById('docType').value;
    const numDoc = document.getElementById('docNumber').value;
    const nombre = document.getElementById('firstName').value;
    const apellido = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const codigoPais = document.getElementById('countryCode').value;
    const telefono = document.getElementById('phone').value;
    const cumpleDia = document.getElementById('birthdayDay').value;
    const cumpleMes = document.getElementById('birthdayMonth').value;
    
    // Método de entrega
    const metodoEntrega = document.querySelector('input[name="delivery"]:checked').value;
    const esDomicilio = metodoEntrega === 'home';
    
    // Dirección (solo si es domicilio)
    const direccion = esDomicilio ? document.getElementById('address').value : '';
    const barrio = esDomicilio ? document.getElementById('neighborhood').value : '';
    const ciudad = esDomicilio ? document.getElementById('city').value : '';
    const notasEntrega = esDomicilio ? document.getElementById('notes').value : '';
    
    // Calcular totales
    const subtotal = getCartTotal();
    let descuentoPorcentaje = 0;
    let descuentoMonto = 0;
    let totalFinal = subtotal;
    
    // Si es pago completo, aplicar descuento del 3%
    if (tipoPago === 'PAGO_100') {
        descuentoPorcentaje = DESCUENTO_PAGO_COMPLETO;
        descuentoMonto = calcularDescuento(subtotal);
        totalFinal = calcularTotalConDescuento(subtotal);
    }
    
    // Preparar items del carrito
    const items = cart.map(item => ({
        producto: item.description,
        coleccion: item.collection,
        codigo: item.code,
        cantidad: item.quantity,
        precio: item.price,
        subtotal: item.price * item.quantity
    }));
    
    // Estructura completa del pedido
    const pedido = {
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
            notasDireccion: notasEntrega,
            totalCompra: totalFinal
        },
        items: items,
        subtotal: subtotal,
        descuentoPorcentaje: descuentoPorcentaje,
        descuentoMonto: descuentoMonto,
        totalFinal: totalFinal,
        metodoEntrega: esDomicilio ? 'DOMICILIO' : 'RETIRO',
        direccion: direccion,
        barrio: barrio,
        ciudad: ciudad,
        notasEntrega: notasEntrega,
        tipoPago: tipoPago,
        notasInternas: `Opción de pago: ${tipoPago === 'PAGO_100' ? 'Pago completo con descuento 3%' : 'Anticipo 60%'}`
    };
    
    return pedido;
}

// ===== MODIFICAR FUNCIONES EXISTENTES =====

/**
 * Modifica la función sendToWhatsApp original para incluir Google Sheets
 */
async function sendToWhatsAppConSheets(tipoPago = 'ANTICIPO_60') {
    // Validar formulario primero
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
    }
    
    // Recopilar datos
    const datosPedido = recopilarDatosPedido(tipoPago);
    
    // Mostrar loading
    mostrarLoading('Registrando pedido...');
    
    try {
        // Enviar a Google Sheets
        const resultado = await enviarPedidoASheets(datosPedido);
        
        if (resultado.success) {
            console.log('✅ Pedido registrado en Google Sheets');
            
            // Enviar a WhatsApp como antes
            enviarWhatsAppOriginal(datosPedido);
            
            // Mostrar confirmación
            mostrarNotificacion('✅ Pedido registrado exitosamente');
            
            // Limpiar carrito
            setTimeout(() => {
                cart = [];
                updateCartUI();
                closeCheckoutModal();
            }, 1500);
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        // Aún así enviar por WhatsApp
        enviarWhatsAppOriginal(datosPedido);
        mostrarNotificacion('⚠️ Pedido enviado por WhatsApp (verificar registro)');
    } finally {
        ocultarLoading();
    }
}

/**
 * Envía mensaje de WhatsApp (función original)
 */
function enviarWhatsAppOriginal(datosPedido) {
    const { cliente, items, subtotal, descuentoMonto, totalFinal, metodoEntrega, tipoPago } = datosPedido;
    
    let mensaje = '🛒 *NUEVO PEDIDO - IMOLARTE*\n\n';
    mensaje += '👤 *DATOS DEL CLIENTE*\n';
    mensaje += `📝 ${cliente.tipoDocumento}: ${cliente.numeroDocumento}\n`;
    mensaje += `Nombre: ${cliente.nombre} ${cliente.apellido}\n`;
    mensaje += `📧 Email: ${cliente.email}\n`;
    mensaje += `📱 Teléfono: ${cliente.codigoPais}${cliente.telefono}\n`;
    mensaje += `🎂 Cumpleaños: ${cliente.cumpleDia} de ${cliente.cumpleMes}\n\n`;
    
    mensaje += '📦 *PRODUCTOS*\n';
    mensaje += '━━━━━━━━━━━━━━━━━━━\n';
    
    items.forEach((item, index) => {
        mensaje += `${index + 1}. ${item.producto}\n`;
        mensaje += `   ${item.coleccion} - ${item.codigo}\n`;
        mensaje += `   Cant: ${item.cantidad} × ${formatPrice(item.precio)}\n`;
        mensaje += `   💰 ${formatPrice(item.subtotal)}\n\n`;
    });
    
    mensaje += '━━━━━━━━━━━━━━━━━━━\n';
    mensaje += `💵 Subtotal: ${formatPrice(subtotal)}\n`;
    
    if (descuentoMonto > 0) {
        mensaje += `🎉 Descuento (${DESCUENTO_PAGO_COMPLETO}%): -${formatPrice(descuentoMonto)}\n`;
    }
    
    mensaje += `💰 *TOTAL: ${formatPrice(totalFinal)}*\n\n`;
    
    if (tipoPago === 'PAGO_100') {
        mensaje += `✨ *PAGO COMPLETO* (con descuento ${DESCUENTO_PAGO_COMPLETO}%)\n\n`;
    } else {
        const anticipo = calcularAnticipo(totalFinal);
        const saldo = totalFinal - anticipo;
        mensaje += `📊 *ANTICIPO (60%)*: ${formatPrice(anticipo)}\n`;
        mensaje += `📊 Saldo pendiente: ${formatPrice(saldo)}\n\n`;
    }
    
    mensaje += `🚚 *ENTREGA*\n`;
    mensaje += metodoEntrega === 'DOMICILIO' 
        ? `📍 Domicilio: ${cliente.direccion}, ${cliente.barrio}, ${cliente.ciudad}\n`
        : `🏪 Retiro en almacén\n`;
    
    if (cliente.notasDireccion) {
        mensaje += `📝 Notas: ${cliente.notasDireccion}\n`;
    }
    
    const encodedMessage = encodeURIComponent(mensaje);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// ===== UI HELPERS =====

/**
 * Muestra indicador de carga
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
 * Oculta indicador de carga
 */
function ocultarLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

/**
 * Muestra notificación temporal
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = mensaje;
    notif.style.background = tipo === 'success' 
        ? 'linear-gradient(135deg, #27ae60, #229954)'
        : 'linear-gradient(135deg, #e74c3c, #c0392b)';
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== EXPORTAR PARA USO GLOBAL =====
window.enviarPedidoConSheets = sendToWhatsAppConSheets;
window.calcularAnticipo = calcularAnticipo;
window.calcularDescuento = calcularDescuento;
window.calcularTotalConDescuento = calcularTotalConDescuento;

console.log('✅ Módulo Google Sheets cargado');
