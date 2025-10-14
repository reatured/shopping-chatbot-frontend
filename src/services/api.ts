import { API_CONFIG, API_URLS } from '@/config/api';

export async function sendChatMessage(
  message: string,
  apiUrl?: string,
  systemPrompt?: string,
  conversationSummary?: string,
  image?: string,
  imageMediaType?: string
): Promise<string> {
  const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;
  const endpoint = `${baseUrl}${API_CONFIG.ENDPOINTS.CHAT}`;

  // Combine system prompt, conversation summary, and user message
  let combinedMessage = message;

  if (systemPrompt) {
    combinedMessage = `${systemPrompt}\n\nUser: ${message}`;

    // Insert conversation summary between system prompt and user message if available
    if (conversationSummary) {
      combinedMessage = `${systemPrompt}\n\nConversation Summary: ${conversationSummary}\n\nUser: ${message}`;
    }
  } else if (conversationSummary) {
    // If no system prompt but has summary, prepend it
    combinedMessage = `Conversation Summary: ${conversationSummary}\n\nUser: ${message}`;
  }

  // Build FormData
  const formData = new FormData();
  formData.append('message', combinedMessage);

  if (image && imageMediaType) {
    // Convert base64 string to Blob for proper file upload
    const byteCharacters = atob(image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: imageMediaType });

    // Create a File object from the Blob with a proper filename
    const extension = imageMediaType.split('/')[1] || 'jpg';
    const file = new File([blob], `upload.${extension}`, { type: imageMediaType });

    formData.append('image', file);
  }

  // === Enhanced Logging ===
  console.log('📤 [Chat Request] ═══════════════════════════════════════════════════════');
  console.log('URL:', endpoint);
  console.log('Method: POST');
  console.log('User Message:', message);
  if (systemPrompt) {
    console.log('System Prompt:', systemPrompt);
  }
  if (conversationSummary) {
    console.log('Conversation Summary:', conversationSummary);
  }
  if (systemPrompt || conversationSummary) {
    console.log('Combined Message:', combinedMessage);
  }
  if (image && imageMediaType) {
    const imageFile = formData.get('image') as File;
    console.log('Image File:', {
      name: imageFile.name,
      type: imageFile.type,
      size: `${(imageFile.size / 1024).toFixed(2)} KB`
    });
  }

  // Generate curl command for debugging
  let curlCommand = `curl -X POST '${endpoint}' \\\n  -F 'message=${combinedMessage.replace(/'/g, "'\\''")}' \\`;
  if (image && imageMediaType) {
    curlCommand += `\n  -F 'image=@upload.${imageMediaType.split('/')[1] || 'jpg'}'`;
  } else {
    curlCommand = curlCommand.slice(0, -2); // Remove trailing backslash
  }

  console.log('\n🔧 [Curl Equivalent] ─────────────────────────────────────────────────────');
  console.log(curlCommand);

  // Send request
  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const text = await res.text();

  // Log response
  console.log('\n📥 [Chat Response] ═══════════════════════════════════════════════════════');
  console.log('Status:', res.status, res.statusText);
  console.log('Response:', text);
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  return text ?? '';
}

export function convertImageToBase64(file: File): Promise<{ data: string; mediaType: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
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
