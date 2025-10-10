export const API_URLS = {
  PRODUCTION: 'https://ecommerce-chatbot-api-09va.onrender.com',
  LOCAL: 'http://127.0.0.1:8000',
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || API_URLS.PRODUCTION,
  ENDPOINTS: {
    CHAT: '/api/chat/anthropic/stream',
    PRODUCTS: '/api/products',
    PRODUCTS_SEARCH: '/api/products/search',
    PRODUCT_BY_ID: '/api/products',
  }
};
