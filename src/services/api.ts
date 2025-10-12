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
}

export async function sendChatMessage(
  message: string,
  conversationHistory: Message[],
  image?: string,
  imageMediaType?: string,
  onChunk?: (chunk: string) => void,
  onComplete?: (stage?: ConversationStage, summary?: string, productName?: string, quickActions?: string[]) => void,
  onError?: (error: string) => void,
  apiUrl?: string,
  systemPrompt?: string
): Promise<void> {
  try {
    const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;

    // Prepare FormData
    const formData = new FormData();
    formData.append('message', message);
    formData.append('stream', 'true');

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

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let fullResponse = '';  // Accumulate message content for display
    let fullJSON = '';      // Accumulate full JSON for parsing metadata
    let detectedStage: ConversationStage | undefined;
    let detectedSummary: string | undefined;
    let detectedProductName: string | undefined;
    let detectedQuickActions: string[] | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'metadata') {
              // Accumulate metadata but don't display
              fullJSON += data.delta;

            } else if (data.type === 'content') {
              // Display content in real-time
              fullResponse += data.delta;
              fullJSON += data.delta;
              onChunk?.(data.delta);

            } else if (data.type === 'done') {
              // Log the complete response for debugging
              console.group('📥 API Response from Backend');
              console.log('Full JSON:', fullJSON);
              console.log('Message Content:', fullResponse);

              // Try to parse the complete JSON to extract metadata
              try {
                const structuredResponse: StructuredResponse = JSON.parse(fullJSON);
                console.log('✅ Parsed Structured Response:', structuredResponse);

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
              } catch (parseError) {
                console.warn('⚠️ Initial JSON parsing failed, applying fallback strategies');
                console.log('Parse Error:', parseError);

                // Fallback 1: Try extracting JSON from mixed text using regex
                const jsonMatch = fullJSON.match(/\{[^{}]*?"message"[^{}]*?\}/s);
                if (jsonMatch) {
                  try {
                    const extracted: StructuredResponse = JSON.parse(jsonMatch[0]);
                    console.log('✅ Fallback 1: Extracted JSON from mixed text');
                    detectedStage = extracted.stage;
                    detectedSummary = extracted.summary;
                    detectedProductName = extracted.product_name;
                    detectedQuickActions = extracted.quick_actions;
                  } catch (extractError) {
                    console.warn('Fallback 1 failed, trying next strategy');
                  }
                }

                // Fallback 2: Check if response is markdown code block
                if (!detectedStage && fullJSON.includes('```json')) {
                  const cleanedJSON = fullJSON.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
                  try {
                    const extracted: StructuredResponse = JSON.parse(cleanedJSON);
                    console.log('✅ Fallback 2: Extracted JSON from markdown code block');
                    detectedStage = extracted.stage;
                    detectedSummary = extracted.summary;
                    detectedProductName = extracted.product_name;
                    detectedQuickActions = extracted.quick_actions;
                  } catch (markdownError) {
                    console.warn('Fallback 2 failed, using default values');
                  }
                }

                // Fallback 3: Use safe defaults for plain text responses
                if (detectedStage === undefined) {
                  console.log('⚠️ All parsing strategies failed, using default values');
                  detectedStage = 0; // Default to general conversation
                  detectedSummary = "General conversation";
                  detectedQuickActions = [];
                  // fullResponse already contains the plain text message
                }
              }

              console.groupEnd();
              onComplete?.(detectedStage, detectedSummary, detectedProductName, detectedQuickActions);

            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
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
