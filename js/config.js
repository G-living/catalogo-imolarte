// js/config.js – All shared constants & settings
// Used by every other module

export const CONFIG = {
  // === Backend ===
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxaoRuG9JLeSh4EWpcfDg-k68WdjheklfoJ90P7LN3XiQ4B9V2ZTR1eBhxieo-N2Z5rLw/exec',

  // === Wompi (sandbox) ===
  WOMPI_PUBLIC_KEY: 'pub_test_rT7K8rzYnk2Ec8Lv25tRL3JIof6b6Lwp', // ← Replace with your real sandbox key
  WOMPI_SIGNATURE_URL: 'https://imolarte-signature-generator.filippo-massara2016.workers.dev',

  // === Currency & Formatting ===
  CURRENCY: 'COP',
  PRICE_LOCALE: 'es-CO',

  // === Dono (Gift Credit) Settings ===
  DONO: {
    MIN_AMOUNT: 50000,
    MAX_AMOUNT: 5000000,
    PRESETS: [50000, 100000, 200000, 500000, 1000000],
    DEFAULT_AMOUNT: 200000,
    CODE_PREFIX: 'DONO-',
    CODE_LENGTH: 10,
    EXPIRATION_DAYS: 365
  },

  // === WhatsApp ===
  WHATSAPP: {
    BUSINESS_NUMBER: '573004257367'
  },

  // === Referral Pyramid (credit only) ===
  REFERRAL: {
    LEVEL1_RATE: 0.05,  // 5% credit to direct referrer
    LEVEL2_RATE: 0.02   // 2% credit to referrer's referrer
  },

  // === UI ===
  TOAST_DURATION: 5000
};