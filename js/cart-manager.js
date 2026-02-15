/**
 * ================================================================
 * IMOLARTE - GESTIÓN DE CARRITO CON TIMER
 * ================================================================
 * Maneja persistencia, expiración y notificaciones del carrito
 * Versión: 1.0
 * ================================================================
 */

// ===== CONFIGURACIÓN =====

const CART_CONFIG = {
  EXPIRACION_MINUTOS: 15,
  AVISO_MINUTOS: 10, // Avisar cuando falten 5 minutos
  STORAGE_KEY: 'imolarte_cart',
  TIMER_KEY: 'imolarte_cart_timer'
};

// ===== GESTIÓN DE TIMER =====

let cartTimer = null;
let cartTimerInterval = null;

/**
 * Inicia el timer del carrito
 */
function iniciarTimerCarrito() {
  // Guardar timestamp de inicio
  const ahora = Date.now();
  localStorage.setItem(CART_CONFIG.TIMER_KEY, ahora.toString());
  
  // Limpiar timers anteriores
  if (cartTimer) clearTimeout(cartTimer);
  if (cartTimerInterval) clearInterval(cartTimerInterval);
  
  // Timer para limpiar a los 15 minutos
  cartTimer = setTimeout(() => {
    limpiarCarritoPorExpiracion();
  }, CART_CONFIG.EXPIRACION_MINUTOS * 60 * 1000);
  
  // Timer para avisar a los 10 minutos (faltan 5)
  const tiempoAviso = CART_CONFIG.AVISO_MINUTOS * 60 * 1000;
  setTimeout(() => {
    mostrarNotificacionExpiracion();
  }, tiempoAviso);
  
  // Actualizar display cada minuto
  cartTimerInterval = setInterval(() => {
    actualizarDisplayTimer();
  }, 60000); // Cada minuto
  
  console.log('⏰ Timer de carrito iniciado (15 min)');
}

/**
 * Detiene el timer del carrito
 */
function detenerTimerCarrito() {
  if (cartTimer) {
    clearTimeout(cartTimer);
    cartTimer = null;
  }
  if (cartTimerInterval) {
    clearInterval(cartTimerInterval);
    cartTimerInterval = null;
  }
  localStorage.removeItem(CART_CONFIG.TIMER_KEY);
  
  console.log('⏰ Timer de carrito detenido');
}

/**
 * Calcula tiempo restante en minutos
 */
function getTiempoRestante() {
  const inicio = localStorage.getItem(CART_CONFIG.TIMER_KEY);
  if (!inicio) return 0;
  
  const transcurrido = Date.now() - parseInt(inicio);
  const restante = (CART_CONFIG.EXPIRACION_MINUTOS * 60 * 1000) - transcurrido;
  
  return Math.max(0, Math.floor(restante / 60000)); // En minutos
}

/**
 * Actualiza el display del timer en la UI
 */
function actualizarDisplayTimer() {
  const minutos = getTiempoRestante();
  const timerElement = document.getElementById('cart-timer');
  
  if (timerElement && cart.length > 0) {
    if (minutos > 0) {
      timerElement.textContent = `⏰ Carrito expira en ${minutos} min`;
      timerElement.style.display = 'block';
      
      // Color de advertencia cuando quedan menos de 5 minutos
      if (minutos <= 5) {
        timerElement.style.color = '#e74c3c';
        timerElement.style.fontWeight = 'bold';
      } else {
        timerElement.style.color = '#7f8c8d';
        timerElement.style.fontWeight = 'normal';
      }
    } else {
      timerElement.style.display = 'none';
    }
  }
}

// ===== NOTIFICACIONES =====

/**
 * Muestra notificación de que quedan 5 minutos
 */
function mostrarNotificacionExpiracion() {
  if (cart.length === 0) return;
  
  // Notificación visual
  mostrarNotificacionPush(
    '⚠️ Tu carrito expirará en 5 minutos',
    'warning',
    10000 // 10 segundos
  );
  
  // Vibración si está disponible
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
  
  console.log('⚠️ Notificación: Carrito expira en 5 min');
}

/**
 * Limpia el carrito por expiración
 */
function limpiarCarritoPorExpiracion() {
  if (cart.length === 0) return;
  
  console.log('🗑️ Carrito expirado - limpiando');
  
  // Guardar items para mostrar en notificación
  const cantidadItems = cart.length;
  
  // Limpiar carrito
  cart = [];
  guardarCarrito();
  updateCartUI();
  detenerTimerCarrito();
  
  // Notificación
  mostrarNotificacionPush(
    `🗑️ Tu carrito de ${cantidadItems} productos expiró`,
    'info',
    8000
  );
  
  // Vibración
  if ('vibrate' in navigator) {
    navigator.vibrate([300, 100, 300, 100, 300]);
  }
}

// ===== PERSISTENCIA =====

/**
 * Guarda el carrito en localStorage
 */
function guardarCarrito() {
  try {
    localStorage.setItem(CART_CONFIG.STORAGE_KEY, JSON.stringify(cart));
    
    if (cart.length > 0) {
      // Si hay items, asegurar que el timer está activo
      if (!localStorage.getItem(CART_CONFIG.TIMER_KEY)) {
        iniciarTimerCarrito();
      }
    } else {
      // Si está vacío, detener timer
      detenerTimerCarrito();
    }
  } catch (e) {
    console.error('Error guardando carrito:', e);
  }
}

/**
 * Carga el carrito desde localStorage
 */
function cargarCarrito() {
  try {
    const stored = localStorage.getItem(CART_CONFIG.STORAGE_KEY);
    if (stored) {
      cart = JSON.parse(stored);
      
      // Verificar si el carrito expiró
      const tiempoRestante = getTiempoRestante();
      
      if (tiempoRestante <= 0 && cart.length > 0) {
        console.log('🗑️ Carrito expirado al cargar');
        cart = [];
        guardarCarrito();
      } else if (cart.length > 0) {
        // Reiniciar timer desde donde quedó
        const inicio = localStorage.getItem(CART_CONFIG.TIMER_KEY);
        if (inicio) {
          const transcurrido = Date.now() - parseInt(inicio);
          const restante = (CART_CONFIG.EXPIRACION_MINUTOS * 60 * 1000) - transcurrido;
          
          if (restante > 0) {
            // Reiniciar timers
            iniciarTimerCarrito();
            console.log(`⏰ Timer restaurado: ${Math.floor(restante / 60000)} min restantes`);
          } else {
            limpiarCarritoPorExpiracion();
          }
        } else {
          iniciarTimerCarrito();
        }
      }
      
      updateCartUI();
    }
  } catch (e) {
    console.error('Error cargando carrito:', e);
    cart = [];
  }
}

/**
 * Limpia el carrito completamente
 */
function limpiarCarritoCompletamente() {
  cart = [];
  guardarCarrito();
  updateCartUI();
  detenerTimerCarrito();
  
  console.log('🗑️ Carrito limpiado manualmente');
}

// ===== NOTIFICACIÓN PUSH =====

/**
 * Muestra notificación tipo push
 */
function mostrarNotificacionPush(mensaje, tipo = 'info', duracion = 5000) {
  const colores = {
    info: '#3498db',
    warning: '#f39c12',
    error: '#e74c3c',
    success: '#27ae60'
  };
  
  const notif = document.createElement('div');
  notif.className = 'cart-notification';
  notif.textContent = mensaje;
  notif.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${colores[tipo] || colores.info};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 100000;
    font-family: 'Lato', sans-serif;
    font-size: 0.95rem;
    max-width: 300px;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, duracion);
}

// ===== AGREGAR AL CARRITO (MODIFICADO) =====

/**
 * Modificar función original addToCart para incluir timer
 */
const addToCartOriginal = window.addToCart;

window.addToCart = function(...args) {
  // Llamar función original
  const resultado = addToCartOriginal.apply(this, args);
  
  // Guardar y reiniciar timer
  guardarCarrito();
  
  return resultado;
};

// ===== INICIALIZACIÓN =====

/**
 * Inicializar al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
  // Cargar carrito guardado
  cargarCarrito();
  
  // Agregar display de timer al header del carrito
  agregarDisplayTimer();
  
  console.log('✅ Gestión de carrito inicializada');
});

/**
 * Agregar elemento visual del timer
 */
function agregarDisplayTimer() {
  // Buscar el header del carrito
  const cartHeader = document.querySelector('.cart h3');
  
  if (cartHeader) {
    const timerDiv = document.createElement('div');
    timerDiv.id = 'cart-timer';
    timerDiv.style.cssText = `
      font-size: 0.85rem;
      color: #7f8c8d;
      margin-top: 0.5rem;
      display: none;
    `;
    
    cartHeader.parentNode.insertBefore(timerDiv, cartHeader.nextSibling);
    
    // Actualizar inmediatamente
    actualizarDisplayTimer();
  }
}

// ===== ANIMACIONES CSS =====

const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ===== EXPORTAR FUNCIONES =====

window.guardarCarrito = guardarCarrito;
window.cargarCarrito = cargarCarrito;
window.limpiarCarritoCompletamente = limpiarCarritoCompletamente;
window.getTiempoRestante = getTiempoRestante;

console.log('✅ Módulo de gestión de carrito cargado');
