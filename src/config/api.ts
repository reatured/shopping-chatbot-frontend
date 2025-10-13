export const API_URLS = {
  PRODUCTION: 'https://ecommerce-chatbot-api-09va.onrender.com',
  LOCAL: 'http://0.0.0.0:8000',
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || API_URLS.LOCAL,
  ENDPOINTS: {
    CHAT: '/chat',
    META_CATEGORIES: '/meta/categories',
    META_OPTIONS: '/meta/options',
    PRODUCT_BY_ID: '/products',
    HEALTH: '/health',
  }
};
