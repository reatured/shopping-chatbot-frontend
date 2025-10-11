# Shopping Chatbot Frontend

Modern, responsive React frontend for the AI-powered shopping assistant. Features real-time streaming chat, image upload, and conversation management.

**Live Demo**: [https://shopping-chatbot-frontend.lovable.app](https://shopping-chatbot-frontend.lovable.app)

---

## Features

### Core Capabilities
- **Real-time Streaming Chat**: See AI responses as they're generated using Server-Sent Events
- **Image Upload**: Upload product images to find similar items
- **Conversation History**: Save and switch between multiple chat sessions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Glassmorphism design with smooth animations

### User Experience
- Typing indicators during AI response generation
- Image preview before sending
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Auto-scroll to latest messages
- Error handling with user-friendly messages

---

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library with modern hooks and concurrent features |
| **TypeScript** | Type safety and better developer experience |
| **Vite** | Lightning-fast dev server and optimized builds |
| **shadcn/ui** | High-quality, accessible component primitives |
| **Tailwind CSS** | Utility-first styling for rapid development |
| **TanStack Query** | Data fetching, caching, and state management |
| **React Router** | Client-side routing |
| **Lucide React** | Beautiful, consistent icons |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager

```bash
# Check Node.js version
node --version  # Should be 18.x or higher
```

### Installation

```bash
# Navigate to frontend directory
cd shopping-chatbot-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint for code quality
```

---

## Project Structure

```
src/
├── components/              # React components
│   ├── ui/                 # shadcn/ui primitives (Button, Input, etc.)
│   ├── ChatInput.tsx       # Message input with image upload
│   ├── ChatMessage.tsx     # Message bubble component
│   ├── Sidebar.tsx         # Conversation history sidebar
│   ├── TypingIndicator.tsx # Loading animation
│   └── SettingsModal.tsx   # Settings dialog
│
├── pages/                  # Route pages
│   ├── Index.tsx          # Main chat interface
│   └── NotFound.tsx       # 404 page
│
├── services/              # API & external services
│   └── api.ts            # Backend API client + SSE streaming
│
├── hooks/                 # Custom React hooks
│   └── use-mobile.tsx    # Mobile detection hook
│
├── lib/                   # Utilities
│   └── utils.ts          # Helper functions (cn, etc.)
│
├── App.tsx               # Root component with routing
├── main.tsx              # React app entry point
└── index.css             # Global styles & Tailwind imports
```

---

## Key Components

### Index.tsx (`src/pages/Index.tsx`)
Main chat interface that orchestrates the entire user experience.

**Responsibilities**:
- Manages conversation state (messages, history)
- Handles message sending and streaming responses
- Coordinates sidebar, chat display, and input
- Persists conversations to localStorage

**Key State**:
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [conversations, setConversations] = useState<Conversation[]>([]);
const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
const [streamingMessage, setStreamingMessage] = useState<string>("");
```

### ChatInput.tsx (`src/components/ChatInput.tsx`)
Message input with image upload and validation.

**Features**:
- Multi-line text input with auto-resize
- Image upload with drag-and-drop support
- Image validation (type, size limits)
- Base64 encoding for transmission
- Keyboard shortcuts

**Props**:
```typescript
interface ChatInputProps {
  onSendMessage: (message: string, imageData?: { data: string; type: string }) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

### ChatMessage.tsx (`src/components/ChatMessage.tsx`)
Displays user and assistant messages with proper formatting.

**Features**:
- Markdown rendering for rich text
- Image preview for uploaded images
- Timestamp display
- Role-based styling (user vs assistant)

### Sidebar.tsx (`src/components/Sidebar.tsx`)
Conversation history management.

**Features**:
- List all conversations with preview
- Create new conversation
- Switch between conversations
- Delete conversations
- Mobile-responsive with overlay

---

## API Integration

### Backend Connection

The frontend connects to the FastAPI backend at:
- **Development**: `http://localhost:8000`
- **Production**: `https://ecommerce-chatbot-api-09va.onrender.com`

Configure in `src/services/api.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

### Streaming Implementation

The app uses Server-Sent Events (SSE) for real-time streaming:

```typescript
// From services/api.ts
export async function sendChatMessage(
  message: string,
  conversationHistory: Message[],
  imageData?: { data: string; type: string },
  onChunk?: (text: string) => void,
  onComplete?: () => void,
  onError?: (error: string) => void
): Promise<void> {
  const formData = new FormData();
  formData.append("message", message);

  // Add conversation history for context
  if (conversationHistory.length > 0) {
    formData.append("conversation_history", JSON.stringify(
      conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ));
  }

  // Add image if provided
  if (imageData) {
    const blob = await fetch(imageData.data).then(r => r.blob());
    formData.append("image", blob);
    formData.append("image_media_type", imageData.type);
  }

  // Stream response
  const response = await fetch(`${API_URL}/api/chat/anthropic/stream`, {
    method: "POST",
    body: formData,
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));

        if (data.type === "content") {
          onChunk?.(data.delta);
        } else if (data.type === "done") {
          onComplete?.();
        } else if (data.type === "error") {
          onError?.(data.message);
        }
      }
    }
  }
}
```

---

## Configuration

### Environment Variables

Create a `.env` file in the frontend root:

```bash
# Backend API URL
VITE_API_URL=http://localhost:8000

# Optional: Enable debug mode
VITE_DEBUG=false
```

### API Endpoint

Change the backend URL in `src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

---

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Output directory: dist/
# - Minified JavaScript
# - Optimized assets
# - Source maps (if enabled)

# Preview production build locally
npm run preview
```

### Deployment

The app is deployed on **Lovable.dev** with automatic deployments from the main branch.

**Manual Deployment Options**:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Static Hosting**: Upload `dist/` folder

---

## Browser Support

Tested and optimized for:
- ✅ Chrome 90+ (recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Required Features**:
- ES2020 JavaScript
- CSS Grid & Flexbox
- Server-Sent Events (SSE)
- LocalStorage API

---

## Development Tips

### Hot Reload
Vite provides instant hot module replacement (HMR):
```bash
npm run dev
# Edit any file → See changes instantly
```

### Type Checking
TypeScript checks types during build and in your IDE:
```bash
# Manual type check
npx tsc --noEmit
```

### Debugging
Enable debug mode in browser console:
```javascript
localStorage.setItem('debug', 'true');
// Reload page to see detailed logs
```

### Code Style
The project uses ESLint for code quality:
```bash
npm run lint          # Check for issues
npm run lint -- --fix # Auto-fix issues
```

---

## Troubleshooting

### Issue: "Cannot connect to backend"
**Solution**:
1. Check backend is running at `http://localhost:8000`
2. Verify CORS is enabled in backend
3. Check `VITE_API_URL` in `.env`

### Issue: "Image upload fails"
**Solution**:
1. Ensure image is < 5MB
2. Use JPEG, PNG, or WebP format
3. Check browser console for errors

### Issue: "Streaming stops mid-response"
**Solution**:
1. Check network connectivity
2. Verify backend API key is valid
3. Look for errors in browser DevTools → Network tab

---

## Contributing

This is a portfolio project for interview evaluation. Contributions are not currently accepted.

---

## License

This project is part of a take-home assignment and is not licensed for public use.
