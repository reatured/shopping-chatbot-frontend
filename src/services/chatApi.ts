import { API_CONFIG } from '@/config/api';
import { Message } from '@/utils/storage';
import { validateAndSanitize, ChatResponse as ValidatedChatResponse } from '@/utils/responseValidator';

export interface ChatRequest {
  client_conversation_id: string;
  messages: Array<{ role: string; content: string }>;
  top_k?: number;
  last_suggested_function?: string;
}

export type ChatResponse = ValidatedChatResponse;

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

  const rawResponse = await response.json();

  // Validate and sanitize response
  const { response: validatedResponse, validation } = validateAndSanitize(rawResponse);

  // Log warnings in development
  if (validation.warnings.length > 0 && import.meta.env.DEV) {
    console.warn('Chat response validation warnings:', validation.warnings);
  }

  // Log errors in development
  if (!validation.isValid && import.meta.env.DEV) {
    console.error('Chat response validation errors:', validation.errors);
  }

  return validatedResponse;
}

export async function getCategories(): Promise<string[]> {
  const baseUrl = localStorage.getItem('api_url') || API_CONFIG.BASE_URL;

  const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.META_CATEGORIES}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data = await response.json();

  // Backend returns { categories: [...], updated_at: "..." }
  return data.categories || [];
}

export async function getOptions(column: string): Promise<string[]> {
  const baseUrl = localStorage.getItem('api_url') || API_CONFIG.BASE_URL;

  const response = await fetch(
    `${baseUrl}${API_CONFIG.ENDPOINTS.META_OPTIONS}?column=${encodeURIComponent(column)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch options: ${response.status}`);
  }

  const data = await response.json();

  // Backend returns { column: "...", options: [...], updated_at: "..." }
  // Backend already caps at 4 and appends "More" if needed
  return data.options || [];
}

export async function getProductById(id: number): Promise<any> {
  const baseUrl = localStorage.getItem('api_url') || API_CONFIG.BASE_URL;
  
  const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.PRODUCT_BY_ID}/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`);
  }

  return response.json();
}
