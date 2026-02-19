// js/google-sheets-integration.js – Sheet API calls (createOrder, createDono, createWishlist, validateCode, etc.)

import { CONFIG } from './config.js';
import { showToast } from './ui.js';

// Generic fetch to Apps Script
async function sendToSheet(action, data) {
  try {
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data })
    });

    const result = await response.json();
    if (!result.success) {
      showToast(result.message || 'Error al guardar en Sheet', 'error');
    }
    return result;
  } catch (err) {
    console.error('Sheet error:', err);
    showToast('Error de conexión con Sheet', 'error');
    return { success: false };
  }
}

// Create order
export async function createOrder(orderData) {
  return sendToSheet('createOrder', orderData);
}

// Create dono
export async function createDono(donoData) {
  return sendToSheet('createDono', donoData);
}

// Create wishlist
export async function createWishlist(wishlistData) {
  return sendToSheet('createWishlist', wishlistData);
}

// Validate dono code
export async function validateDonoCode(code) {
  return sendToSheet('validateDonoCode', { code });
}

// Validate referral code
export async function validateReferralCode(code) {
  return sendToSheet('validateReferralCode', { code });
}

// ... add more as needed (e.g. updateTotals, healthCheck)