import { useState, useEffect, useRef } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { SettingsModal } from "@/components/SettingsModal";
import { ProductsPanel } from "@/components/ProductsPanel";
import { QuickActionButtons } from "@/components/QuickActionButtons";
import { sendChatMessage, Message as ApiMessage } from "@/services/api";
import { Product } from "@/services/productApi";
import { toast } from "sonner";
import { API_CONFIG, API_URLS } from "@/config/api";
import { getSystemPrompt } from "@/config/prompts";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [quickActions, setQuickActions] = useState<string[]>(["Trending", "Popular", "Car", "Backpack"]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('api_url') || API_URLS.PRODUCTION;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "New Chat",
      timestamp: "Now",
      messages: [
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI shopping assistant. I can help you find products, answer questions, and provide recommendations. You can also upload images of items you\'re interested in!',
          timestamp: new Date(),
        }
      ]
    }
  ]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    localStorage.setItem('api_url', apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);

  const handleSendMessage = async (message: string, image?: string, imageMediaType?: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      image: image ? `data:${imageMediaType};base64,${image}` : undefined,
      timestamp: new Date(),
    };

    // Update conversations
    setConversations(prev => prev.map(conv =>
      conv.id === activeConversationId
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    ));

    // Update conversation title with first message
    if (messages.length === 1) {
      const title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, title }
          : conv
      ));
    }

    // Start streaming
    setIsStreaming(true);
    setCurrentStreamingMessage("");

    // Convert conversation history to API format
    const conversationHistory: ApiMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    let fullResponse = '';
    let responseContent = '';

    await sendChatMessage(
      message,
      conversationHistory,
      image,
      imageMediaType,
      (chunk) => {
        // Update streaming message
        fullResponse += chunk;
        setCurrentStreamingMessage(fullResponse);
      },
      (detectedProducts, detectedActions) => {
        // Streaming complete - handle products and actions from AI response

        // Update products if provided
        if (detectedProducts && detectedProducts.length > 0) {
          console.log('📦 Products received:', detectedProducts.length, 'products');
          setProducts(detectedProducts);
          setMobileProductsOpen(true); // Auto-open products panel on mobile
        }

        // Update quick actions if provided
        if (detectedActions && detectedActions.length > 0) {
          console.log('⚡ Quick Actions updated:', detectedActions);
          setQuickActions(detectedActions);
        } else {
          // Clear quick actions if none provided
          setQuickActions([]);
        }

        // Use the accumulated fullResponse as the message content
        responseContent = fullResponse;

        // Add assistant message with the extracted content
        setConversations(prev => prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, {
                  role: 'assistant',
                  content: responseContent,
                  timestamp: new Date()
                }]
              }
            : conv
        ));
        setIsStreaming(false);
        setCurrentStreamingMessage("");
      },
      (error) => {
        // Error handling
        setIsStreaming(false);
        setCurrentStreamingMessage("");
        toast.error(error || "Failed to send message, please retry");
      },
      apiUrl,
      getSystemPrompt()
    );
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: "New Chat",
      timestamp: "Now",
      messages: [
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI shopping assistant. How can I help you today?',
          timestamp: new Date(),
        }
      ]
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
    setQuickActions(["Trending", "Popular", "Car", "Backpack"]); // Reset quick actions
    setProducts([]); // Clear products
    setSelectedProductId(null); // Reset selected product
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleQuickAction = (action: string) => {
    // Clear quick actions when user clicks one
    setQuickActions([]);
    // Send the quick action as a message
    handleSendMessage(action);
  };

  const handleProductClick = (productId: number) => {
    console.log('🖱️ Product clicked:', productId);
    setSelectedProductId(productId);
  };

  const handleBackToSearch = () => {
    console.log('⬅️ Back to search');
    setSelectedProductId(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        conversations={conversations}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex relative z-10 border-r border-gray-200">
        <div className="flex-1 flex flex-col">
          {/* Header */}
        <header className="border-b border-gray-200 p-3 md:p-4 glass">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-base md:text-lg font-semibold truncate">AI Shopping Assistant</h1>
            </div>
            <SettingsModal
              apiUrl={apiUrl}
              onApiUrlChange={setApiUrl}
            />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6">
          <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} {...msg} />
            ))}
            {isStreaming && currentStreamingMessage && (
              <ChatMessage
                role="assistant"
                content={currentStreamingMessage}
                timestamp={new Date()}
              />
            )}
            {isStreaming && !currentStreamingMessage && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

          {/* Quick Action Buttons */}
          {quickActions.length > 0 && (
            <QuickActionButtons
              actions={quickActions}
              onActionClick={handleQuickAction}
            />
          )}

          {/* Input Area */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={false}
          />
        </div>

        {/* Products Panel */}
        <ProductsPanel
          products={products}
          selectedProductId={selectedProductId}
          onBackToSearch={handleBackToSearch}
          onProductClick={handleProductClick}
          apiUrl={apiUrl}
          mobileOpen={mobileProductsOpen}
          onMobileOpenChange={setMobileProductsOpen}
        />

        {/* Floating Action Button for Mobile (only show when products are available) */}
        {products.length > 0 && (
          <Button
            onClick={() => setMobileProductsOpen(true)}
            className="lg:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-gray-800 hover:bg-gray-900 z-50"
            size="icon"
          >
            <ShoppingBag className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
