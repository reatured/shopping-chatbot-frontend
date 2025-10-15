# Shopping Chatbot Frontend

An **AI-powered shopping assistant** that helps users find products through conversation and image search.
---


- **General Conversation** – natural, open-ended chat with a single unified agent  
- **Text-Based Product Recommendation** – e.g., “Recommend me a t-shirt for sports.”  
- **Image-Based Product Search** – upload an image to find visually similar catalog items  

---

## Demo Web Page
👉 [Frontend Demo](https://shop-glass-ai.lovable.app/)  
👉 [Backend Repo](https://github.com/reatured/ecommerce-chatbot-api)  
👉 [Product Database](https://docs.google.com/spreadsheets/d/1LjQn5xgkAsXlW0kxCfq60C8P_siXzzGksx8LdMOH9YU/edit?usp=sharing)  
_Add more products in any category, and the chatbot automatically adapts its recommendations in real time._

---

## Screenshots
**Start Page**  
The landing page showcasing entry points to the AI shopping assistant.  
![Start Page](./Image/Start%20Page.jpeg)

**General Chat**  
General chat interface for open-ended shopping questions and guidance.  
![General Chat](./Image/AI%20Shopping%20General%20Chat.jpeg)

**Filter with AI**  
AI-powered product filtering to refine results by attributes and preferences.  
![Filter with AI](./Image/Filter%20with%20AI.png)

**Clarification Questions**  
AI asks clarifying questions to better understand the user’s needs before recommending.  
![Clarification Questions](./Image/Clarification%20questions%20from%20AI%20.png)

**Product Results from Custom Database**  
Products are retrieved from a custom database to ensure accurate, up-to-date results.  
![Product Results](./Image/Product%20queried%20from%20custom%20database.png)

**Product Detail Page**  
Detailed product view including specs, visuals, and purchase actions.  
![Product Detail Page](./Image/Product%20detail%20page.png)

**Product Chat with Quick Buttons**  
Contextual quick action buttons accelerate follow-up requests during product conversations.  
![Product Chat with Quick Buttons](./Image/Product%20Chat%20with%20Quick%20Buttons.png)

**Image Search**  
Upload an image to find visually similar products from the catalog.  
![Image Search](./Image/Image%20Search.png)

**Image Search 2**  
Another example of visual search results returned from an uploaded image.  
![Image Search 2](./Image/Image%20Search%202.png)

---

## Backend API Endpoints

This project uses the E-commerce Chatbot API (backend) located in `ecommerce-chatbot-api/`. Below is a consolidated reference of the available endpoints, their purpose, parameters, example usage, and sample responses to help the frontend integrate with the backend.

Note: All endpoints are served under the same host where the backend is deployed. Replace `BASE_URL` with your backend origin (for local development this may be `http://localhost:8000`).

### 1) Health / Root
- Route: `GET /`
- Description: Basic health check and endpoint discovery. Returns a list of available routes and notes.
- Parameters: none
- Sample use (curl):

	GET ${BASE_URL}/

- Sample response:

	{
		"status": "ok",
		"message": "E-commerce Chatbot API is running",
		"endpoints": {
			"init": "/api/init",
			"anthropic_chat": "/api/chat/anthropic/stream",
			"products_list": "/api/products?category={category}&color={color}",
			"products_search": "/api/products/search?q={query}",
			"product_by_id": "/api/products/{id}"
		},
		"notes": { ... }
	}

### 2) Initialize App
- Route: `GET /api/init`
- Description: Wake backend specifically for my online deployment on Render as it need 30 seconds to be awake after long time of inactivity.
- Parameters: none
- Sample use (curl):

	GET ${BASE_URL}/api/init

- Sample response:

	{
		"status": "ready",
		"categories": ["car", "backpack"],
		"metadata": {
			"total_products": 50,
			"colors_available": ["red","blue","black"],
			"last_updated": "2025-10-10T12:00:00Z",
			"cache_ttl_seconds": 300
		}
	}

### 3) List Products
- Route: `GET /api/products`
- Description: Returns all products with optional filters for `category` and `color`.
- Query parameters:
	- `category` (optional) — Filter by product category (e.g., `car`, `backpack`).
	- `color` (optional) — Filter by color.
- Sample use (curl):

	GET ${BASE_URL}/api/products?category=backpack&color=blue

- Sample response (truncated):

	{
		"products": [
			{
				"id": 1,
				"name": "Blue Hiking Backpack",
				"brand": "TrailCo",
				"price": 79.99,
				"color": "Blue",
				"category": "backpack",
				"description": "A durable hiking backpack...",
				"image_url": "https://...",
				"tags": "hiking,outdoor"
			}
		],
		"count": 1,
		"filters": {"category": "backpack", "color": "blue"}
	}

### 4) Search Products
- Route: `GET /api/products/search`
- Description: Full-text keyword search across `name`, `description`, `brand`, `tags`, and `color`.
- Query parameters:
	- `q` (required) — Search query string (minimum 2 characters).
	- `category` (optional) — Limit search to a specific category.
- Sample use (curl):

	GET ${BASE_URL}/api/products/search?q=waterproof+backpack&category=backpack

- Sample response (truncated):

	{
		"products": [ /* matching product objects */ ],
		"count": 3,
		"query": "waterproof backpack",
		"category": "backpack"
	}

### 5) Get Product by ID
- Route: `GET /api/products/{product_id}`
- Description: Retrieve a single product by its integer ID.
- Path parameters:
	- `product_id` (required) — integer product id.
- Sample use (curl):

	GET ${BASE_URL}/api/products/123

- Sample response (product object):

	{
		"id": 123,
		"name": "Sample Product",
		"brand": "Brand",
		"price": 49.99,
		"color": "black",
		"category": "car",
		"description": "Full product description...",
		"image_url": "https://...",
		"tags": "auto,accessory"
	}


---

