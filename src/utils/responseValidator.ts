/**
 * Response Validator for Chat API Responses
 *
 * Validates that chat responses conform to the required contract:
 * - Required fields: stage, message, summary, product_name, quick_actions
 * - Optional fields: suggested_functions, data
 * - Caps: items ≤20, facet options ≤4, suggested_functions ≤1
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
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

const PRODUCT_LIST_MAX = 20;
const OPTIONS_MAX = 4;
const SUGGESTED_FUNCTIONS_MAX = 1;
const QUICK_ACTIONS_MIN = 2;
const QUICK_ACTIONS_MAX = 4;

/**
 * Validate a chat response against the required contract
 */
export function validateChatResponse(response: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if response exists
  if (!response || typeof response !== 'object') {
    errors.push('Response is null or not an object');
    return { isValid: false, errors, warnings };
  }

  // Validate required fields
  const requiredFields = ['stage', 'message', 'summary', 'product_name', 'quick_actions'];
  for (const field of requiredFields) {
    if (!(field in response)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate stage
  if ('stage' in response) {
    if (![0, 1, 2].includes(response.stage)) {
      errors.push(`Invalid stage value: ${response.stage}. Must be 0, 1, or 2`);
    }
  }

  // Validate message
  if ('message' in response) {
    if (typeof response.message !== 'string' || response.message.trim().length === 0) {
      errors.push('Message must be a non-empty string');
    }
  }

  // Validate summary
  if ('summary' in response) {
    if (typeof response.summary !== 'string') {
      errors.push('Summary must be a string');
    } else {
      const wordCount = response.summary.trim().split(/\s+/).length;
      if (wordCount < 5 || wordCount > 20) {
        warnings.push(`Summary should be 5-20 words (current: ${wordCount})`);
      }
    }
  }

  // Validate product_name
  if ('product_name' in response) {
    if (typeof response.product_name !== 'string' || response.product_name.trim().length === 0) {
      errors.push('Product name must be a non-empty string');
    }
  }

  // Validate quick_actions
  if ('quick_actions' in response) {
    if (!Array.isArray(response.quick_actions)) {
      errors.push('Quick actions must be an array');
    } else {
      if (response.quick_actions.length < QUICK_ACTIONS_MIN) {
        warnings.push(`Quick actions should have at least ${QUICK_ACTIONS_MIN} items`);
      }
      if (response.quick_actions.length > QUICK_ACTIONS_MAX) {
        warnings.push(`Quick actions should have at most ${QUICK_ACTIONS_MAX} items (current: ${response.quick_actions.length})`);
      }
      if (!response.quick_actions.every((action: any) => typeof action === 'string')) {
        errors.push('All quick actions must be strings');
      }
    }
  }

  // Validate suggested_functions (optional)
  if ('suggested_functions' in response && response.suggested_functions !== null) {
    if (!Array.isArray(response.suggested_functions)) {
      errors.push('Suggested functions must be an array or null');
    } else {
      if (response.suggested_functions.length > SUGGESTED_FUNCTIONS_MAX) {
        errors.push(`Suggested functions must have at most ${SUGGESTED_FUNCTIONS_MAX} item (current: ${response.suggested_functions.length})`);
      }
      for (const func of response.suggested_functions) {
        if (!func.function || !func.endpoint || !func.method) {
          errors.push('Each suggested function must have function, endpoint, and method fields');
        }
      }
    }
  }

  // Validate data (optional)
  if ('data' in response && response.data !== null) {
    const data = response.data;

    if (typeof data !== 'object') {
      errors.push('Data must be an object or null');
    } else {
      // Validate mode
      if ('mode' in data) {
        if (!['list', 'detail'].includes(data.mode)) {
          errors.push(`Invalid data mode: ${data.mode}. Must be 'list' or 'detail'`);
        }
      }

      // Validate items (cap at 20)
      if ('items' in data && data.items !== null) {
        if (!Array.isArray(data.items)) {
          errors.push('Data items must be an array or null');
        } else {
          if (data.items.length > PRODUCT_LIST_MAX) {
            errors.push(`Data items must have at most ${PRODUCT_LIST_MAX} items (current: ${data.items.length})`);
          }
        }
      }

      // Validate total
      if ('total' in data) {
        if (typeof data.total !== 'number' || data.total < 0) {
          errors.push('Data total must be a non-negative number');
        }
      }

      // Validate facets (cap options at 4)
      if ('facets' in data && data.facets !== null) {
        if (typeof data.facets !== 'object') {
          errors.push('Data facets must be an object or null');
        } else {
          for (const [key, value] of Object.entries(data.facets)) {
            if (!Array.isArray(value)) {
              errors.push(`Facet '${key}' must be an array`);
            } else {
              // Check if it has more than 4 options without "More"
              const hasMore = value.includes('More');
              const optionsWithoutMore = value.filter(v => v !== 'More');

              if (optionsWithoutMore.length > OPTIONS_MAX) {
                errors.push(`Facet '${key}' has more than ${OPTIONS_MAX} options without 'More' (current: ${optionsWithoutMore.length})`);
              }

              if (value.length > OPTIONS_MAX + 1) {
                errors.push(`Facet '${key}' has too many items (current: ${value.length}, max: ${OPTIONS_MAX + 1} including 'More')`);
              }
            }
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Enforce caps on a response object (mutates the object)
 */
export function enforceCaps(response: any): ChatResponse {
  if (!response || typeof response !== 'object') {
    return response;
  }

  // Enforce quick_actions cap
  if (Array.isArray(response.quick_actions) && response.quick_actions.length > QUICK_ACTIONS_MAX) {
    response.quick_actions = response.quick_actions.slice(0, QUICK_ACTIONS_MAX);
  }

  // Enforce suggested_functions cap
  if (Array.isArray(response.suggested_functions) && response.suggested_functions.length > SUGGESTED_FUNCTIONS_MAX) {
    response.suggested_functions = response.suggested_functions.slice(0, SUGGESTED_FUNCTIONS_MAX);
  }

  // Enforce data caps
  if (response.data && typeof response.data === 'object') {
    // Enforce items cap
    if (Array.isArray(response.data.items) && response.data.items.length > PRODUCT_LIST_MAX) {
      response.data.items = response.data.items.slice(0, PRODUCT_LIST_MAX);
      response.data.total = Math.max(response.data.total || 0, response.data.items.length);
    }

    // Enforce facets options cap
    if (response.data.facets && typeof response.data.facets === 'object') {
      for (const [key, value] of Object.entries(response.data.facets)) {
        if (Array.isArray(value)) {
          const hasMore = value.includes('More');
          const optionsWithoutMore = value.filter(v => v !== 'More');

          if (optionsWithoutMore.length > OPTIONS_MAX) {
            response.data.facets[key] = [...optionsWithoutMore.slice(0, OPTIONS_MAX), 'More'];
          }
        }
      }
    }
  }

  return response;
}

/**
 * Create a fallback response when validation fails critically
 */
export function createFallbackResponse(errorMessage: string): ChatResponse {
  return {
    stage: 0,
    message: `I apologize, but I encountered an error processing your request: ${errorMessage}. Please try again or rephrase your question.`,
    summary: 'Error processing request',
    product_name: 'general',
    quick_actions: [
      'Show all categories',
      'Help me get started',
    ],
    suggested_functions: [],
    data: {
      mode: 'list',
      items: [],
      total: 0,
      facets: {},
    },
  };
}

/**
 * Validate and sanitize a chat response
 * Returns a valid response or a fallback if validation fails
 */
export function validateAndSanitize(response: any): {
  response: ChatResponse;
  validation: ValidationResult;
} {
  // First, enforce caps
  const sanitized = enforceCaps(response);

  // Then validate
  const validation = validateChatResponse(sanitized);

  // If validation fails with errors, return fallback
  if (!validation.isValid) {
    const fallback = createFallbackResponse(validation.errors[0]);
    return {
      response: fallback,
      validation: {
        isValid: false,
        errors: validation.errors,
        warnings: [...validation.warnings, 'Using fallback response'],
      },
    };
  }

  return {
    response: sanitized,
    validation,
  };
}
