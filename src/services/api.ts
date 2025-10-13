import { API_CONFIG, API_URLS } from '@/config/api';
import { ConversationStage } from '@/config/prompts';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StructuredResponse {
  stage: ConversationStage;
  message: string;
  summary?: string;
  product_name?: string;
  quick_actions?: string[];
  active_filters?: Record<string, string>;
}

export async function sendChatMessage(
  message: string,
  conversationHistory: Message[],
  image?: string,
  imageMediaType?: string,
  onChunk?: (chunk: string) => void,
  onComplete?: (stage?: ConversationStage, summary?: string, productName?: string, quickActions?: string[], activeFilters?: Record<string, string>) => void,
  onError?: (error: string) => void,
  apiUrl?: string,
  systemPrompt?: string
): Promise<void> {
  try {
    const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;

    // Prepare FormData
    const formData = new FormData();
    formData.append('message', message);
    formData.append('stream', 'false');  // Disabled streaming for reliable JSON responses

    // Add system prompt if provided
    if (systemPrompt) {
      formData.append('system_prompt', systemPrompt);
    }

    // Filter valid history (remove empty messages)
    const validHistory = conversationHistory.filter(msg =>
      msg.content && msg.content.trim().length > 0
    );

    // Add conversation history if exists
    if (validHistory.length > 0) {
      formData.append('conversation_history', JSON.stringify(validHistory));
    }

    // Add image if provided (convert base64 to File)
    if (image && imageMediaType) {
      const base64Data = image.split(',')[1] || image;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: imageMediaType });
      const file = new File([blob], 'image.jpg', { type: imageMediaType });
      formData.append('image', file);
    }

    // Log the entire request payload for debugging
    console.group('🚀 API Request to Backend');
    console.log('URL:', `${baseUrl}${API_CONFIG.ENDPOINTS.CHAT}`);
    console.log('Message:', message);
    console.log('System Prompt:', systemPrompt || 'None');
    console.log('Conversation History:', validHistory);
    console.log('Has Image:', !!image);
    console.groupEnd();

    const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.CHAT}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Non-streaming mode: Get complete JSON response
    const responseData = await response.json();

    console.group('📥 API Response from Backend');
    console.log('Response Data:', responseData);

    // Extract content from the response
    let messageContent = '';
    let detectedStage: ConversationStage | undefined;
    let detectedSummary: string | undefined;
    let detectedProductName: string | undefined;
    let detectedQuickActions: string[] | undefined;
    let detectedActiveFilters: Record<string, string> | undefined;

    if (responseData.type === 'complete') {
      // Backend returned a complete response
      const content = responseData.content;

      // Try to parse as structured JSON first
      try {
        const structuredResponse: StructuredResponse = JSON.parse(content);
        console.log('Parsed Structured Response:', structuredResponse);

        // Extract message content
        messageContent = structuredResponse.message || '';

        // Extract metadata
        if (structuredResponse.stage !== undefined) {
          detectedStage = structuredResponse.stage;
          console.log('Detected Stage:', detectedStage);
        }

        if (structuredResponse.summary) {
          detectedSummary = structuredResponse.summary;
          console.log('Detected Summary:', detectedSummary);
        }

        if (structuredResponse.product_name) {
          detectedProductName = structuredResponse.product_name;
          console.log('Detected Product Name:', detectedProductName);
        }

        if (structuredResponse.quick_actions) {
          detectedQuickActions = structuredResponse.quick_actions;
          console.log('Detected Quick Actions:', detectedQuickActions);
        }

        if (structuredResponse.active_filters) {
          detectedActiveFilters = structuredResponse.active_filters;
          console.log('Detected Active Filters:', detectedActiveFilters);
        }

        // VALIDATION: Check if AI mentions finding products but didn't set proper metadata
        const foundProductsPattern = /I found (\d+)|found (\d+) (product|item|option|result)/i;
        const mentionsProducts = foundProductsPattern.test(messageContent);

        if (mentionsProducts) {
          if (!detectedStage || detectedStage !== 1) {
            console.warn('⚠️ AI VALIDATION WARNING: Message mentions finding products but stage is not 1');
            console.warn('   Message:', messageContent);
            console.warn('   Current stage:', detectedStage);
          }
          if (!detectedProductName || detectedProductName.trim() === '') {
            console.warn('⚠️ AI VALIDATION WARNING: Message mentions finding products but product_name is not set');
            console.warn('   Message:', messageContent);
            console.warn('   Product name:', detectedProductName);
          }
        }

        // Display the complete message at once
        if (messageContent && onChunk) {
          onChunk(messageContent);
        }
      } catch (parseError) {
        // If parsing fails, treat the entire content as plain text message
        console.warn('Response is not structured JSON, treating as plain text');
        console.log('Parse Error:', parseError);
        messageContent = content || '';

        // Display plain text at once
        if (messageContent && onChunk) {
          onChunk(messageContent);
        }
      }
    } else if (responseData.type === 'error') {
      throw new Error(responseData.message || 'Unknown error from backend');
    } else {
      // Fallback: treat entire response as message
      console.warn('Unexpected response format, using fallback');
      messageContent = responseData.content || JSON.stringify(responseData);
      if (onChunk) {
        onChunk(messageContent);
      }
    }

    console.log('Final Message Content:', messageContent);
    console.groupEnd();

    // Call completion callback
    onComplete?.(detectedStage, detectedSummary, detectedProductName, detectedQuickActions, detectedActiveFilters);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    onError?.(errorMessage);
  }
}


export function convertImageToBase64(file: File): Promise<{ data: string; mediaType: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64String = result.split(",")[1];

      resolve({
        data: base64String,
        mediaType: file.type,
        filename: file.name,
      });
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
