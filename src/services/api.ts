import { API_CONFIG, API_URLS } from '@/config/api';

export async function sendChatMessage(
  message: string,
  apiUrl?: string,
  systemPrompt?: string,
  image?: string,
  imageMediaType?: string
): Promise<string> {
  const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;
  const endpoint = `${baseUrl}${API_CONFIG.ENDPOINTS.CHAT}`;

  // Combine system prompt with user message if provided
  const combinedMessage = systemPrompt
    ? `${systemPrompt}\n\nUser: ${message}`
    : message;

  // Build FormData
  const formData = new FormData();
  formData.append('message', combinedMessage);

  if (image && imageMediaType) {
    formData.append('image', image);
    formData.append('image_media_type', imageMediaType);
  }

  // === Enhanced Logging ===
  console.log('📤 [Chat Request] ═══════════════════════════════════════════════════════');
  console.log('URL:', endpoint);
  console.log('Method: POST');
  console.log('User Message:', message);
  if (systemPrompt) {
    console.log('System Prompt:', systemPrompt);
    console.log('Combined Message:', combinedMessage);
  }
  if (image) {
    console.log('Image:', imageMediaType, `(${image.substring(0, 50)}...)`);
  }

  // Generate curl command for debugging
  let curlCommand = `curl -X POST '${endpoint}' \\\n  -F 'message=${combinedMessage.replace(/'/g, "'\\''")}' \\`;
  if (image && imageMediaType) {
    curlCommand += `\n  -F 'image=${image.substring(0, 50)}...' \\\n  -F 'image_media_type=${imageMediaType}'`;
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
