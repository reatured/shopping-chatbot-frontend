import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { SettingsModal } from "@/components/SettingsModal";
import { QuickActionButtons } from "@/components/QuickActionButtons";
import { sendChatMessage } from "@/services/api";
import { useInitialization } from "@/hooks/useInitialization";
import { toast } from "sonner";
import { API_URLS } from "@/config/api";
import { DEFAULT_SYSTEM_PROMPT } from "@/config/prompts";
import { parseChatResponse, ChatResponseParseError } from "@/utils/chatResponse";

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
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('api_url') || API_URLS.PRODUCTION;
  });
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [conversationSummary, setConversationSummary] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化分类（仅用于 Quick Actions，可选）
  const {
    isLoading: isInitializing,
    categories,
    error: initError,
    isInitialized
  } = useInitialization(apiUrl);

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

  // 同步 Quick Actions
  useEffect(() => {
    if (categories.length > 0) {
      setQuickActions(categories);
    }
  }, [categories]);

  // 初始化失败提示（不影响最简 chat）
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
  }, [messages]);

  const handleSendMessage = async (message: string, image?: string, imageMediaType?: string) => {
    // 1) 先把用户消息落地
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === activeConversationId
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    ));

    // 2) 若是该会话第一条"用户消息"，更新会话标题
    const userMsgCount = (activeConversation?.messages || []).filter(m => m.role === 'user').length;
    if (userMsgCount === 0) {
      const title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId ? { ...conv, title } : conv
      ));
    }

    // 3) 发送消息，支持系统提示和图片
    try {
      const replyText = await sendChatMessage(
        message,
        apiUrl,
        systemPrompt || undefined,
        image,
        imageMediaType
      );

      // Parse the nested JSON response
      try {
        const parsedData = parseChatResponse(replyText);

        // Log parsed response for debugging
        console.log('\n📋 [Parsed Response] ═════════════════════════════════════════════════');
        console.log(JSON.stringify(parsedData, null, 2));
        console.log('═══════════════════════════════════════════════════════════════════════\n');

        // Create assistant message with parsed content
        const assistantMsg: Message = {
          role: 'assistant',
          content: parsedData.message,
          timestamp: new Date(),
        };

        setConversations(prev => prev.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, assistantMsg] }
            : conv
        ));

        // Update quick actions if provided
        if (parsedData.quick_actions && parsedData.quick_actions.length > 0) {
          setQuickActions(parsedData.quick_actions);
        }

        // Update conversation summary
        if (parsedData.summary) {
          setConversationSummary(parsedData.summary);
        }

      } catch (parseError) {
        // Fallback: If parsing fails, use raw response
        console.error('Failed to parse chat response:', parseError);

        const assistantMsg: Message = {
          role: 'assistant',
          content: replyText || 'Sorry, I received an unexpected response format.',
          timestamp: new Date(),
        };

        setConversations(prev => prev.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, assistantMsg] }
            : conv
        ));

        if (parseError instanceof ChatResponseParseError) {
          toast.error('Response format error', {
            description: 'Received an unexpected response format from the server.',
          });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message");
    }
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

  const handleQuickAction = (action: string) => {
    setQuickActions([]); // 点击后清空快捷键（可选）
    handleSendMessage(action);
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
                systemPrompt={systemPrompt}
                onSystemPromptChange={setSystemPrompt}
              />
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} {...msg} />
              ))}
              {/* 非流式最简：初始化加载提示（可留） */}
              {isInitializing && messages.length === 1 && (
                <div className="text-center py-4" role="status" aria-live="polite">
                  <p className="text-sm text-muted-foreground">Getting ready...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Action Buttons（可选） */}
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

        {/* 🔕 已去除 ProductsPanel，保留最简聊天 */}
      </div>
    </div>
  );
};

export default Index;
