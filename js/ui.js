// js/ui.js – Shared UI helpers

import { CONFIG } from './config.js';

export function formatPrice(num) {
  return '$' + Number(num).toLocaleString(CONFIG.PRICE_LOCALE);
}

export function showToast(message, type = 'info') {
  const bg = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#007bff'
  }[type] || '#007bff';

  Toastify({
    text: message,
    duration: CONFIG.TOAST_DURATION,
    gravity: "top",
    position: "center",
    backgroundColor: bg,
    stopOnFocus: true
  }).showToast();
}

export function showLoading(btn, text = 'Procesando...') {
  if (!btn) return;
  btn.dataset.originalText = btn.innerHTML;
  btn.innerHTML = text;
  btn.disabled = true;
}

export function hideLoading(btn) {
  if (!btn || !btn.dataset.originalText) return;
  btn.innerHTML = btn.dataset.originalText;
  btn.disabled = false;
  delete btn.dataset.originalText;
}

export function createModal(title, contentHTML, onClose = () => {}) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center; z-index: 9999;
  `;

  modal.innerHTML = `
    <div style="
      background: white; border-radius: 16px; padding: 32px; max-width: 600px; width: 90%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3); position: relative; max-height: 90vh; overflow-y: auto;
    ">
      <button class="close-modal" style="
        position: absolute; top: 16px; right: 16px; background: none; border: none;
        font-size: 32px; cursor: pointer; color: #666;
      ">×</button>
      <h2 style="text-align:center; color:#b8975e; margin-bottom:24px;">${title}</h2>
      ${contentHTML}
    </div>
  `;

  modal.querySelector('.close-modal').onclick = () => {
    modal.remove();
    onClose();
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
      onClose();
    }
  };

  document.body.appendChild(modal);
  return modal;
}