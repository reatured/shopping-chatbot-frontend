import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ConversationList } from "@/components/ConversationList";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ProductsPanel } from "@/components/ProductsPanel";
import { QuickActionButtons } from "@/components/QuickActionButtons";
import { SettingsModal } from "@/components/SettingsModal";
import { sendChatMessage, getCategories, getOptions, getProductById } from "@/services/chatApi";
import {
  getAllConversations,
  saveConversation,
  deleteConversation,
  createNewConversation,
  updateConversationTitle,
  getActiveConversationId,
  setActiveConversationId,
  getLastNMessages,
  Conversation,
  Message,
  ProductCard,
} from "@/utils/storage";

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductCard[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productDetailMode, setProductDetailMode] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('api_url') || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];
  const lastMessage = messages[messages.length - 1];
  const quickActions = lastMessage?.role === 'assistant' ? lastMessage.quick_actions || [] : [];
  const facets = lastMessage?.role === 'assistant' ? lastMessage.data?.facets : undefined;

  // Load conversations on mount
  useEffect(() => {
    const loaded = getAllConversations();
    if (loaded.length === 0) {
      const newConv = createNewConversation();
      saveConversation(newConv);
      setConversations([newConv]);
      setActiveId(newConv.id);
      setActiveConversationId(newConv.id);
    } else {
      setConversations(loaded);
      const activeId = getActiveConversationId();
      if (activeId && loaded.find(c => c.id === activeId)) {
        setActiveId(activeId);
      } else {
        setActiveId(loaded[0].id);
        setActiveConversationId(loaded[0].id);
      }
    }
  }, []);

  // Update products when last message changes
  useEffect(() => {
    if (lastMessage?.role === 'assistant' && lastMessage.data?.items) {
      setSelectedProducts(lastMessage.data.items);
      setProductDetailMode(lastMessage.data.mode === 'detail');
    }
  }, [lastMessage]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save API URL
  useEffect(() => {
    if (apiUrl) {
      localStorage.setItem('api_url', apiUrl);
    }
  }, [apiUrl]);

  const handleNewConversation = () => {
    const newConv = createNewConversation();
    saveConversation(newConv);
    setConversations([newConv, ...conversations]);
    setActiveId(newConv.id);
    setActiveConversationId(newConv.id);
    setSelectedProducts([]);
    setSelectedProductId(null);
    setProductDetailMode(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setActiveConversationId(id);
    
    // Load products from last message
    const conv = conversations.find(c => c.id === id);
    const lastMsg = conv?.messages[conv.messages.length - 1];
    if (lastMsg?.role === 'assistant' && lastMsg.data?.items) {
      setSelectedProducts(lastMsg.data.items);
      setProductDetailMode(lastMsg.data.mode === 'detail');
    } else {
      setSelectedProducts([]);
      setProductDetailMode(false);
    }
    setSelectedProductId(null);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    
    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
        setActiveConversationId(updated[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    updateConversationTitle(id, newTitle);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversation) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
    };

    const updatedConversation: Conversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage],
    };

    // Update title from first user message
    if (activeConversation.messages.length === 0 && content.length > 0) {
      updatedConversation.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }

    saveConversation(updatedConversation);
    setConversations(prev => prev.map(c => c.id === activeConversationId ? updatedConversation : c));

    setIsLoading(true);

    try {
      // Get last N messages for context
      const contextMessages = getLastNMessages(updatedConversation, 10);
      
      // Get last suggested function if any
      const lastAssistantMsg = [...updatedConversation.messages]
        .reverse()
        .find(m => m.role === 'assistant');
      const lastSuggestedFunction = lastAssistantMsg?.suggested_functions?.[0]?.function;

      const response = await sendChatMessage(
        activeConversation.id,
        contextMessages,
        lastSuggestedFunction
      );

      // Create assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        quick_actions: response.quick_actions,
        suggested_functions: response.suggested_functions,
        data: response.data,
      };

      const finalConversation: Conversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        last_suggested_function: response.suggested_functions?.[0]?.function,
      };

      saveConversation(finalConversation);
      setConversations(prev => prev.map(c => c.id === activeConversationId ? finalConversation : c));

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    // Check if it's a function suggestion
    if (lastMessage?.role === 'assistant' && lastMessage.suggested_functions) {
      const matchingFunction = lastMessage.suggested_functions.find(
        f => f.function === action || action.toLowerCase().includes(f.function.toLowerCase())
      );

      if (matchingFunction) {
        try {
          if (matchingFunction.function === 'Get all categories') {
            const categories = await getCategories();
            toast.success(`Loaded ${categories.length} categories`);
            // Show categories as quick actions or in a modal
            return;
          } else if (matchingFunction.function === 'Get all options') {
            // Extract column from endpoint
            const columnMatch = matchingFunction.endpoint.match(/column=([^&]+)/);
            if (columnMatch) {
              const options = await getOptions(columnMatch[1]);
              toast.success(`Loaded ${options.length} options`);
              return;
            }
          }
        } catch (error) {
          toast.error('Failed to fetch data');
        }
      }
    }

    // Otherwise, send as regular message
    handleSendMessage(action);
  };

  const handleProductClick = async (productId: number) => {
    try {
      setSelectedProductId(productId);
      const productDetail = await getProductById(productId);
      
      // Update the products list with the detailed product
      setSelectedProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, ...productDetail } : p)
      );
      setProductDetailMode(true);
    } catch (error) {
      toast.error('Failed to load product details');
    }
  };

  const handleBackToList = () => {
    setSelectedProductId(null);
    setProductDetailMode(false);
  };

  const handleOptionClick = (column: string, option: string) => {
    // When user clicks an option from the OptionsBar, send it as a new message
    const query = `Show ${column}: ${option}`;
    handleSendMessage(query);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left: Conversation List */}
      <div className="w-64 hidden lg:block border-r">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
        />
      </div>

      {/* Center: Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">AI Shopping Assistant</h1>
          <SettingsModal apiUrl={apiUrl} onApiUrlChange={setApiUrl} />
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && !isLoading && (
          <QuickActionButtons
            actions={quickActions}
            onActionClick={handleQuickAction}
          />
        )}

        {/* Input */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>

      {/* Right: Products Panel */}
      {selectedProducts.length > 0 && (
        <div className="w-96 hidden xl:block border-l">
          <ProductsPanel
            products={selectedProducts}
            selectedProductId={selectedProductId}
            detailMode={productDetailMode}
            facets={facets}
            onProductClick={handleProductClick}
            onBackToList={handleBackToList}
            onOptionClick={handleOptionClick}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
