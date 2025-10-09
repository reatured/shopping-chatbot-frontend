import { API_CONFIG } from '@/config/api';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  message: string,
  conversationHistory: Message[],
  image?: string,
  imageMediaType?: string,
  onChunk?: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: string) => void,
): Promise<void> {
  try {
    // Prepare FormData
    const formData = new FormData();
    formData.append('message', message);
    formData.append('stream', 'true');

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

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'content') {
              onChunk?.(data.delta);
            } else if (data.type === 'done') {
              onComplete?.();
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
