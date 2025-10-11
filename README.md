# 1) Target Features
- **General Conversation** – natural, open-ended chat with a single unified agent  
- **Text-Based Product Recommendation** – e.g., “Recommend me a t-shirt for sports.”  
- **Image-Based Product Search** – upload an image to find visually similar catalog items  

# 2) Demo Web Page
👉 [Frontend Demo](https://shop-glass-ai.lovable.app/)  
👉 [Backend Repo](https://github.com/reatured/ecommerce-chatbot-api)  
👉 [Product Database](https://docs.google.com/spreadsheets/d/1LjQn5xgkAsXlW0kxCfq60C8P_siXzzGksx8LdMOH9YU/edit?usp=sharing) — add more products in any category, and the chatbot will automatically adapt its recommendations in real time.

# 3) Screenshot — Chat
![Chat Interface](./screenshots/chat.png)

# 4) Screenshot — Product Panel Page
![Product Panel](./screenshots/product-panel.png)

# 5) Screenshot — Product Detail Page
![Product Detail](./screenshots/product-detail.png)

# 6) Backend API Endpoints

**Base URL (Production)**: `https://ecommerce-chatbot-api-09va.onrender.com`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/init` | GET | Get initialization data (categories, welcome message, system prompt) |
| `/api/chat/anthropic/stream` | POST | Send chat message with streaming response (supports text + image) |
| `/api/products` | GET | Get all products (optional `?category=` filter) |
| `/api/products/search` | GET | Search products by query `?q=` (optional `&category=`) |
| `/api/products/{id}` | GET | Get single product by ID |

