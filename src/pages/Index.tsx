import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { SettingsModal } from "@/components/SettingsModal";
import { ProductsPanel } from "@/components/ProductsPanel";
import { QuickActionButtons } from "@/components/QuickActionButtons";
import { sendChatMessage, Message as ApiMessage } from "@/services/api";
import { useInitialization } from "@/hooks/useInitialization";
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
  const [productCategoryDecided, setProductCategoryDecided] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [conversationSummary, setConversationSummary] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('api_url') || API_URLS.PRODUCTION;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize categories from backend
  const {
    isLoading: isInitializing,
    categories,
    error: initError,
    isInitialized
  } = useInitialization(apiUrl);

  // Use categories from initialization as quick actions for new conversations
  const [quickActions, setQuickActions] = useState<string[]>(categories);
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

  // Sync quick actions when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !productCategoryDecided) {
      setQuickActions(categories);
    }
  }, [categories, productCategoryDecided]);

  // Show error toast if initialization failed
  useEffect(() => {
    if (initError) {
      toast.error('Connecting to server...', {
        description: 'Using cached data. Some features may be limited.',
        duration: 5000,
      });
    }
  }, [initError]);

  useEffect(() => {
    localStorage.setItem('api_url', apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);

  const handleSendMessage = async (message: string, image?: string, imageMediaType?: string) => {
    // Track if this message has an image
    const hasImage = !!image;

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

    // Get system prompt
    const systemPrompt = getSystemPrompt(categories);
    console.log('💬 Sending message with categories:', categories);

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
      (productDecided, detectedSummary, detectedCategoryName, detectedQuickActions, detectedActiveFilters) => {
        // Streaming complete - use the clean message content (fullResponse)
        // Metadata has already been extracted by the API service

        // If image was uploaded and we got a category name, show products
        if (hasImage && detectedCategoryName) {
          console.log('🖼️ Image uploaded with category:', detectedCategoryName);
          setProductCategoryDecided(true);
          setCategoryName(detectedCategoryName);
        }
        // Otherwise update based on backend response
        else if (productDecided !== undefined) {
          console.log('🔄 Product category decided:', productDecided);
          setProductCategoryDecided(productDecided);
        }

        // Update category name if provided (even without image)
        if (detectedCategoryName && !hasImage) {
          console.log('🏷️ Category Name updated:', detectedCategoryName);
          setCategoryName(detectedCategoryName);
        }

        // Update summary if provided
        if (detectedSummary) {
          console.log('📝 Summary updated:', detectedSummary);
          setConversationSummary(detectedSummary);
        }

        // Update quick actions if provided
        if (detectedQuickActions) {
          console.log('⚡ Quick Actions received:', detectedQuickActions);
          // Safety: Limit to max 4 actions
          const limitedActions = detectedQuickActions.slice(0, 4);
          setQuickActions(limitedActions);
          if (detectedQuickActions.length > 4) {
            console.warn(`⚠️ Truncated ${detectedQuickActions.length} actions to 4:`, detectedQuickActions);
          }
        }

        // Update active filters if provided
        if (detectedActiveFilters) {
          console.log('🔍 Active Filters updated:', detectedActiveFilters);
          setActiveFilters(detectedActiveFilters);
        }

        // Use the accumulated fullResponse as the message content
        // This is clean text without JSON structure
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
      systemPrompt
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
    setProductCategoryDecided(false); // Reset to general conversation
    setShowProductDetail(false); // Reset detail view
    setConversationSummary(""); // Reset summary
    setCategoryName(""); // Reset category name
    setQuickActions(categories); // Reset quick actions to initialized categories
    setSelectedProductId(null); // Reset selected product
    setActiveFilters({}); // Reset filters
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
    setShowProductDetail(true); // Show product detail
  };

  const handleBackToSearch = () => {
    console.log('⬅️ Back to search');
    setSelectedProductId(null);
    setShowProductDetail(false); // Hide product detail
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
      <div className="flex-1 flex relative z-10 border-r border-gray-200 min-w-0">
        <div className="flex-1 flex flex-col w-full min-w-0">
          {/* Header */}
        <header className="border-b border-gray-200 p-3 sm:p-4 glass">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <h1 className="text-sm sm:text-base md:text-lg font-semibold truncate">AI Shopping Assistant</h1>
            </div>
            <SettingsModal
              apiUrl={apiUrl}
              onApiUrlChange={setApiUrl}
              conversationSummary={conversationSummary}
            />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
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
            {isInitializing && messages.length === 1 && (
              <div className="text-center py-4" role="status" aria-live="polite">
                <p className="text-sm text-muted-foreground">Getting ready...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

          {/* Quick Action Buttons */}
          {(quickActions.length > 0 || isInitializing) && (
            <QuickActionButtons
              actions={quickActions}
              onActionClick={handleQuickAction}
              isLoading={isInitializing && !isInitialized}
            />
          )}

          {/* Input Area */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isInitializing && !isInitialized}
          />
        </div>

        {/* Products Panel */}
        <ProductsPanel
          showPanel={productCategoryDecided}
          showDetail={showProductDetail}
          categoryName={categoryName}
          selectedProductId={selectedProductId}
          onBackToSearch={handleBackToSearch}
          onProductClick={handleProductClick}
          apiUrl={apiUrl}
          categories={categories}
          activeFilters={activeFilters}
          onRemoveFilter={(filterKey) => {
            const newFilters = { ...activeFilters };
            delete newFilters[filterKey];
            setActiveFilters(newFilters);
          }}
          onClearFilters={() => setActiveFilters({})}
        />
      </div>
    </div>
  );
};

export default Index;
