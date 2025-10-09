# Shopping Chatbot Frontend

An AI-powered shopping assistant that helps users find products through natural conversation and image search.

## Features

### 1. General Conversation with Agent
Ask the chatbot general questions and have natural conversations:
- "What's your name?"
- "What can you do?"
- "How can you help me?"

### 2. Text-Based Product Recommendation
Get product recommendations based on your description:
- "Recommend me a t-shirt for sports"
- "I need running shoes for marathon training"
- "Show me casual dresses for summer"

### 3. Image-Based Product Search
Upload product images to find similar items or get recommendations:
- Take a photo of a product you like
- Upload an image from your device
- Get recommendations based on visual similarity

**Note:** Product recommendations and search results are limited to items in our predefined catalog.

## Technology Stack

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library
- **shadcn-ui** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

Install Node.js using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (recommended)

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd shopping-chatbot-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn-ui base components
│   ├── ChatInput.tsx   # Message input with image upload
│   ├── ChatMessage.tsx # Message display component
│   ├── Sidebar.tsx     # Conversation history
│   └── SettingsModal.tsx
├── pages/              # Page components
│   ├── Index.tsx       # Main chat interface
│   └── NotFound.tsx
├── services/           # API integration
│   └── api.ts
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
└── App.tsx             # Root component with routing
```

## Configuration

The frontend connects to the backend API for AI-powered responses. The API endpoint can be configured in:

- `src/services/api.ts` - API_URL constant
- `src/pages/Index.tsx` - SettingsModal apiUrl prop

## Usage

1. **Start a conversation**: Type your message in the input field
2. **Upload an image**: Click the camera icon to upload product images
3. **View history**: Access previous conversations from the sidebar
4. **Switch modes**: Use settings to toggle between different AI modes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
