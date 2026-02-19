// js/config.js – All shared constants & settings

export const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxaoRuG9JLeSh4EWpcfDg-k68WdjheklfoJ90P7LN3XiQ4B9V2ZTR1eBhxieo-N2Z5rLw/exec',
  WOMPI_PUBLIC_KEY: 'pub_test_rT7K8rzYnk2Ec8Lv25tRL3JIof6b6Lwp',
  WOMPI_SIGNATURE_URL: 'https://imolarte-signature-generator.filippo-massara2016.workers.dev',
  CURRENCY: 'COP',
  PRICE_LOCALE: 'es-CO',
  PRICING_MULTIPLIER: 12600,  // Euro → COP stable
  DONO: {
    MIN_AMOUNT: 50000,
    MAX_AMOUNT: 5000000,
    PRESETS: [50000, 100000, 200000, 500000, 1000000],
    DEFAULT_AMOUNT: 200000,
    CODE_PREFIX: 'DONO-',
    CODE_LENGTH: 10,
    EXPIRATION_DAYS: 365
  },
  WHATSAPP: {
    BUSINESS_NUMBER: '573004257367'
  },
  REFERRAL: {
    LEVEL1_RATE: 0.05,
    LEVEL2_RATE: 0.02
  },
  TOAST_DURATION: 5000
};