import { Plus, MessageSquare, X } from "lucide-react";
import { Button } from "./ui/button";

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  conversations: Conversation[];
}

export const Sidebar = ({ isOpen, onClose, activeConversationId, onNewChat, onSelectConversation, conversations }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[260px] z-50
          glass border-r border-white/10
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-0
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={onNewChat}
              className="flex-1 glass-hover justify-start gap-2"
              variant="ghost"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="lg:hidden ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose();
                }}
                className={`
                  w-full p-3 rounded-lg text-left
                  transition-all duration-200
                  ${
                    activeConversationId === conv.id
                      ? 'bg-gray-200 border border-gray-300'
                      : 'glass-hover'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{conv.timestamp}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
