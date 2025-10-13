import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Conversation } from '@/utils/storage';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}: ConversationListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const startEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const confirmEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b">
        <Button onClick={onNewConversation} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative rounded-lg transition-colors ${
                activeConversationId === conversation.id
                  ? 'bg-accent'
                  : 'hover:bg-accent/50'
              }`}
            >
              {editingId === conversation.id ? (
                <div className="flex items-center gap-1 p-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={confirmEdit}>
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className="flex items-start gap-2 p-2 w-full text-left"
                  >
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{conversation.title}</span>
                  </button>
                  <div className="absolute right-1 top-1 hidden group-hover:flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => startEdit(conversation)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteId(conversation.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDeleteConversation(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
