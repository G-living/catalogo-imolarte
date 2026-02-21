// js/dono.js
// IMOLARTE - Funcionalidad DONO (Regalar Crédito)

import { CONFIG } from './config.js';
import { formatPrice, showToast, closeModal } from './ui.js';

// ============================================================================
// ESTADO GLOBAL
// ============================================================================

let selectedAmount = 0;
let generatedCode = null;

// ============================================================================
// CONSTANTES
// ============================================================================

const MIN_DONO_AMOUNT = CONFIG.MIN_DONO_AMOUNT || 50000;
const MAX_DONO_AMOUNT = CONFIG.MAX_DONO_AMOUNT || 1000000;
const DONO_PREFIX = CONFIG.DONO_PREFIX || 'DNO-';
const DONO_VALIDITY_DAYS = CONFIG.DONO_VALIDITY_DAYS || 90;

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Genera código DONO único (exportado para checkout-dono.js)
 * @returns {string} Código único
 */
export function generateUniqueDonoCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${DONO_PREFIX}${timestamp}${random}`;
}

/**
 * Inicializa la funcionalidad DONO
 */
export function initDono() {
  console.log('🎁 initDono() llamado');
  
  document.querySelectorAll('.dono-amount-btn').forEach(btn => {
    btn.addEventListener('click', (e) => selectAmount(e));
  });
  
  const customInput = document.getElementById('dono-custom-input');
  if (customInput) {
    customInput.addEventListener('input', (e) => handleCustomAmount(e));
  }
  
  const generateBtn = document.getElementById('generate-dono-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateDonoCode);
  }
  
  const donoBtn = document.getElementById('dono-btn');
  if (donoBtn) {
    donoBtn.addEventListener('click', () => openDonoModal());
  }
  
  const closeBtns = document.querySelectorAll('.close-dono');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => closeModal('dono-modal'));
  });
  
  const copyBtn = document.getElementById('copy-dono-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyDonoCode);
  }
  
  const shareBtn = document.getElementById('share-dono-whatsapp');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareDonoWhatsApp);
  }
  
  const anotherBtn = document.getElementById('generate-another-dono');
  if (anotherBtn) {
    anotherBtn.addEventListener('click', resetDonoForm);
  }
  
  console.log('✅ initDono() completado');
}

function openDonoModal() {
  const modal = document.getElementById('dono-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    resetDonoForm();
  }
}

function selectAmount(e) {
  const btn = e.currentTarget;
  const amount = parseInt(btn.dataset.amount);
  
  if (!amount || amount < MIN_DONO_AMOUNT) {
    showToast('⚠️ Monto inválido', 'error');
    return;
  }
  
  selectedAmount = amount;
  
  document.querySelectorAll('.dono-amount-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  
  const customInput = document.getElementById('dono-custom-input');
  if (customInput) customInput.value = '';
  
  console.log('💰 Monto seleccionado:', selectedAmount);
}

function handleCustomAmount(e) {
  const amount = parseInt(e.target.value);
  
  if (amount && amount >= MIN_DONO_AMOUNT && amount <= MAX_DONO_AMOUNT) {
    selectedAmount = amount;
    document.querySelectorAll('.dono-amount-btn').forEach(b => b.classList.remove('selected'));
  } else {
    selectedAmount = 0;
  }
}

async function generateDonoCode() {
  if (!selectedAmount || selectedAmount < MIN_DONO_AMOUNT) {
    showToast(`⚠️ El monto mínimo es ${formatPrice(MIN_DONO_AMOUNT)}`, 'error');
    return;
  }
  
  const loadingEl = document.getElementById('dono-loading');
  const resultEl = document.getElementById('dono-result');
  const generateBtn = document.getElementById('generate-dono-btn');
  
  if (loadingEl) loadingEl.classList.remove('hidden');
  if (resultEl) resultEl.classList.add('hidden');
  if (generateBtn) generateBtn.disabled = true;
  
  try {
    generatedCode = generateUniqueDonoCode();
    await new Promise(resolve => setTimeout(resolve, 1000));
    showDonoResult(generatedCode, selectedAmount);
    showToast('✅ Código DONO generado exitosamente', 'success');
  } catch (error) {
    console.error('❌ Error generando DONO:', error);
    showToast('⚠️ Error generando código. Intenta de nuevo.', 'error');
  } finally {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (generateBtn) generateBtn.disabled = false;
  }
}

function showDonoResult(code, amount) {
  const resultEl = document.getElementById('dono-result');
  const codeValueEl = document.getElementById('dono-code-value');
  const amountValueEl = document.getElementById('dono-amount-value');
  const expiryDateEl = document.getElementById('dono-expiry-date');
  
  if (codeValueEl) codeValueEl.textContent = code;
  if (amountValueEl) amountValueEl.textContent = formatPrice(amount);
  if (expiryDateEl) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + DONO_VALIDITY_DAYS);
    expiryDateEl.textContent = expiryDate.toLocaleDateString('es-CO');
  }
  if (resultEl) resultEl.classList.remove('hidden');
  
  const formElements = document.querySelectorAll('.dono-amounts, .dono-custom-amount, #generate-dono-btn');
  formElements.forEach(el => el.classList.add('hidden'));
}

async function copyDonoCode() {
  if (!generatedCode) return;
  try {
    await navigator.clipboard.writeText(generatedCode);
    showToast('📋 Código copiado al portapapeles', 'success');
  } catch (error) {
    console.error('Error copiando código:', error);
    showToast('⚠️ No se pudo copiar el código', 'error');
  }
}

function shareDonoWhatsApp() {
  if (!generatedCode || !selectedAmount) return;
  
  const message = `🎁 ¡Te regalo crédito para IMOLARTE!\n\n` +
    `Código: ${generatedCode}\n` +
    `Monto: ${formatPrice(selectedAmount)}\n\n` +
    `Úsalo en tu compra de cerámicas italianas exclusivas.\n` +
    `🛒 ${CONFIG.BASE_URL}/`;
  
  const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  showToast('📱 Abriendo WhatsApp...', 'info');
}

function resetDonoForm() {
  selectedAmount = 0;
  generatedCode = null;
  
  document.querySelectorAll('.dono-amount-btn').forEach(b => b.classList.remove('selected'));
  
  const customInput = document.getElementById('dono-custom-input');
  if (customInput) customInput.value = '';
  
  const resultEl = document.getElementById('dono-result');
  if (resultEl) resultEl.classList.add('hidden');
  
  const formElements = document.querySelectorAll('.dono-amounts, .dono-custom-amount, #generate-dono-btn');
  formElements.forEach(el => el.classList.remove('hidden'));
  
  const generateBtn = document.getElementById('generate-dono-btn');
  if (generateBtn) generateBtn.disabled = false;
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', initDono);