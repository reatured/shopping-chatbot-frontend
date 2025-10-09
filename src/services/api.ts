const API_URL = "https://ecommerce-chatbot-api-09va.onrender.com";

export interface ChatMessage {
  message: string;
  image?: string;
  image_media_type?: string;
  model?: string;
  max_tokens?: number;
}

export interface SearchQuery {
  query: string;
  max_results?: number;
  max_tokens_per_page?: number;
  country?: string | null;
}

export async function sendChatMessage(
  message: string,
  image?: string,
  imageMediaType?: string,
  onChunk?: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: string) => void,
): Promise<void> {
  try {
    const requestBody: ChatMessage = {
      message,
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
    };

    if (image && imageMediaType) {
      requestBody.image = image;
      requestBody.image_media_type = imageMediaType;
    }

    const response = await fetch(`${API_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      onChunk?.(chunk);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send message";
    onError?.(errorMessage);
  }
}

export async function searchWithPerplexity(
  query: string,
  onChunk?: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: string) => void,
): Promise<void> {
  try {
    const requestBody: SearchQuery = {
      query,
      max_results: 5,
      max_tokens_per_page: 1024,
      country: null,
    };

    const response = await fetch(`${API_URL}/api/search/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      onChunk?.(chunk);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Search failed";
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
