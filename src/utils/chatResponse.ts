/**
 * Chat Response Parser Utility
 *
 * Handles parsing and validation of nested JSON responses from the chat API.
 * The API returns a wrapper object with a "reply" field containing a JSON string.
 */

/**
 * Outer wrapper response from API
 */
export interface ChatResponse {
  reply: string;
}

/**
 * Parsed structured data from the inner JSON string
 */
export interface ParsedChatData {
  product_category_decided: boolean;
  message: string;
  summary: string;
  category_name: string;
  quick_actions: string[];
  active_filters: Record<string, any>;
}

/**
 * Error thrown when chat response parsing fails
 */
export class ChatResponseParseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'ChatResponseParseError';
  }
}

/**
 * Validates if the parsed data matches the expected ChatResponse structure
 */
export function isValidChatResponse(data: any): data is ParsedChatData {
  return (
    data !== null &&
    typeof data === 'object' &&
    typeof data.product_category_decided === 'boolean' &&
    typeof data.message === 'string' &&
    typeof data.summary === 'string' &&
    typeof data.category_name === 'string' &&
    Array.isArray(data.quick_actions) &&
    typeof data.active_filters === 'object'
  );
}

/**
 * Parses the nested JSON response from the chat API
 *
 * @param text - Raw text response from the API
 * @returns Parsed and validated chat data
 * @throws {ChatResponseParseError} If parsing or validation fails
 *
 * @example
 * ```ts
 * const rawResponse = '{"reply":"{\\"message\\":\\"Hello!\\"}"}';
 * const parsed = parseChatResponse(rawResponse);
 * console.log(parsed.message); // "Hello!"
 * ```
 */
export function parseChatResponse(text: string): ParsedChatData {
  try {
    // Step 1: Parse outer JSON to get the wrapper object
    const outerJson = JSON.parse(text) as ChatResponse;

    if (!outerJson || typeof outerJson !== 'object') {
      throw new ChatResponseParseError('Response is not a valid JSON object');
    }

    if (!outerJson.reply || typeof outerJson.reply !== 'string') {
      throw new ChatResponseParseError('Response missing "reply" field or it is not a string');
    }

    // Step 2: Parse inner JSON string to get structured data
    const innerJson = JSON.parse(outerJson.reply);

    // Step 3: Validate the structure
    if (!isValidChatResponse(innerJson)) {
      throw new ChatResponseParseError(
        'Response does not match expected ChatResponse structure. ' +
        'Expected fields: product_category_decided, message, summary, category_name, quick_actions, active_filters'
      );
    }

    return innerJson;
  } catch (error) {
    if (error instanceof ChatResponseParseError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new ChatResponseParseError(
        `Failed to parse JSON response: ${error.message}`,
        error
      );
    }

    throw new ChatResponseParseError(
      `Unexpected error parsing chat response: ${error}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Safely attempts to parse chat response, returning null on failure
 * Useful when you want to handle errors without throwing
 *
 * @param text - Raw text response from the API
 * @returns Parsed chat data or null if parsing fails
 *
 * @example
 * ```ts
 * const parsed = tryParseChatResponse(rawResponse);
 * if (parsed) {
 *   console.log(parsed.message);
 * } else {
 *   console.log('Failed to parse response');
 * }
 * ```
 */
export function tryParseChatResponse(text: string): ParsedChatData | null {
  try {
    return parseChatResponse(text);
  } catch {
    return null;
  }
}
