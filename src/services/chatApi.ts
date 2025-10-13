import { API_CONFIG } from '@/config/api';
import { Message } from '@/utils/storage';

export interface ChatRequest {
  client_conversation_id: string;
  messages: Array<{ role: string; content: string }>;
  top_k?: number;
  last_suggested_function?: string;
}

export interface ChatResponse {
  stage: 0 | 1 | 2;
  message: string;
  summary: string;
  product_name: string;
  quick_actions: string[];
  suggested_functions?: Array<{
    function: string;
    endpoint: string;
    method: string;
  }>;
  data?: {
    mode: 'list' | 'detail';
    items?: any[];
    total?: number;
    facets?: Record<string, string[]>;
  };
}

export async function sendChatMessage(
  conversationId: string,
  messages: Message[],
  lastSuggestedFunction?: string
): Promise<ChatResponse> {
  const baseUrl = localStorage.getItem('api_url') || API_CONFIG.BASE_URL;
  
  const requestBody: ChatRequest = {
    client_conversation_id: conversationId,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    top_k: 20,
  };

  if (lastSuggestedFunction) {
    requestBody.last_suggested_function = lastSuggestedFunction;
  }

  const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.CHAT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getCategories(): Promise<string[]> {
  const baseUrl = localStorage.getItem('api_url') || API_CONFIG.BASE_URL;
  
  const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.META_CATEGORIES}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  return response.json();
}

export async function getOptions(column: string): Promise<string[]> {
  const baseUrl = localStorage.getItem('api_url') || API_CONFIG.BASE_URL;
  
  const response = await fetch(
    `${baseUrl}${API_CONFIG.ENDPOINTS.META_OPTIONS}?column=${encodeURIComponent(column)}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch options: ${response.status}`);
  }

  const options = await response.json();
  
  // Cap at 4, append "More" if there are more
  if (Array.isArray(options) && options.length > 4) {
    return [...options.slice(0, 4), 'More'];
  }
  
  return options;
}

export async function getProductById(id: number): Promise<any> {
  const baseUrl = localStorage.getItem('api_url') || API_CONFIG.BASE_URL;
  
  const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.PRODUCT_BY_ID}/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`);
  }

  return response.json();
}
