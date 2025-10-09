import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { SettingsModal } from "@/components/SettingsModal";
import { sendChatMessage, Message as ApiMessage } from "@/services/api";
import { toast } from "sonner";
import { API_CONFIG, API_URLS } from "@/config/api";

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
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('api_url') || API_URLS.PRODUCTION;
  });
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
      () => {
        // Streaming complete - add assistant message
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversationId 
            ? { 
                ...conv, 
                messages: [...conv.messages, {
                  role: 'assistant',
                  content: fullResponse,
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
      apiUrl
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
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
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
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="border-b border-gray-200 p-4 glass">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold">AI Shopping Assistant</h1>
            </div>
            <SettingsModal 
              apiUrl={apiUrl}
              onApiUrlChange={setApiUrl}
            />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
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
          </div>
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
        />
      </div>
    </div>
  );
};

export default Index;
