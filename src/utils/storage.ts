export interface Message {
  role: 'user' | 'assistant';
  content: string;
  quick_actions?: string[];
  suggested_functions?: SuggestedFunction[];
  data?: ResponseData;
}

export interface SuggestedFunction {
  function: string;
  endpoint: string;
  method: string;
}

export interface ResponseData {
  mode: 'list' | 'detail';
  items?: ProductCard[];
  total?: number;
  facets?: Record<string, string[]>;
}

export interface ProductCard {
  id: number;
  name: string;
  brand?: string;
  price?: number;
  color?: string;
  image_url?: string;
  category?: string;
  description?: string;
  publish_time?: string;
  selling_quantity?: number;
  tags?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
  last_suggested_function?: string;
}

const STORAGE_KEY = 'ai_shopping_conversations';
const ACTIVE_CONVERSATION_KEY = 'ai_shopping_active_conversation';

export function getAllConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

export function getConversation(id: string): Conversation | null {
  const conversations = getAllConversations();
  return conversations.find(c => c.id === id) || null;
}

export function saveConversation(conversation: Conversation): void {
  try {
    const conversations = getAllConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

export function deleteConversation(id: string): void {
  try {
    const conversations = getAllConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    if (getActiveConversationId() === id) {
      clearActiveConversation();
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
}

export function createNewConversation(): Conversation {
  return {
    id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'New Conversation',
    created_at: new Date().toISOString(),
    messages: [],
  };
}

export function updateConversationTitle(id: string, title: string): void {
  try {
    const conversations = getAllConversations();
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      conversation.title = title;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  } catch (error) {
    console.error('Failed to update conversation title:', error);
  }
}

export function getActiveConversationId(): string | null {
  return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
}

export function setActiveConversationId(id: string): void {
  localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
}

export function clearActiveConversation(): void {
  localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
}

export function getLastNMessages(conversation: Conversation, n: number = 10): Message[] {
  return conversation.messages.slice(-n);
}
