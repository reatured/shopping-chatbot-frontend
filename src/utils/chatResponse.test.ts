/**
 * Simple test examples for chatResponse parser
 *
 * To run these tests in the browser console:
 * 1. Import the functions: import { parseChatResponse } from './chatResponse'
 * 2. Copy and paste the test examples
 */

import { parseChatResponse, tryParseChatResponse, ChatResponseParseError } from './chatResponse';

// Example 1: Valid nested JSON response (your actual API response format)
const validResponse = `{"reply":"{\\"product_category_decided\\":false,\\"message\\":\\"Hi there! I'm your shopping assistant. What product are you interested in today?\\",\\"summary\\":\\"Greeting and ready to help\\",\\"category_name\\":\\"\\",\\"quick_actions\\":[\\"Backpacks\\",\\"Cars\\",\\"Outdoor Gear\\",\\"Electronics\\"],\\"active_filters\\":{}}"}`;

console.log('=== Test 1: Valid Response ===');
try {
  const result = parseChatResponse(validResponse);
  console.log('✓ Parsed successfully!');
  console.log('Message:', result.message);
  console.log('Summary:', result.summary);
  console.log('Quick Actions:', result.quick_actions);
  console.log('Category Decided:', result.product_category_decided);
  console.log('Full result:', result);
} catch (error) {
  console.error('✗ Failed:', error);
}

// Example 2: Another valid response with category selected
const validResponseWithCategory = `{"reply":"{\\"product_category_decided\\":true,\\"message\\":\\"Great! I found some backpacks for you.\\",\\"summary\\":\\"Showing backpacks\\",\\"category_name\\":\\"Backpacks\\",\\"quick_actions\\":[],\\"active_filters\\":{\\"color\\":\\"blue\\"}}"}`;

console.log('\n=== Test 2: Valid Response with Category ===');
try {
  const result = parseChatResponse(validResponseWithCategory);
  console.log('✓ Parsed successfully!');
  console.log('Message:', result.message);
  console.log('Category:', result.category_name);
  console.log('Filters:', result.active_filters);
} catch (error) {
  console.error('✗ Failed:', error);
}

// Example 3: Invalid JSON (missing reply field)
const invalidResponse = `{"data":"some data"}`;

console.log('\n=== Test 3: Invalid Response (missing reply field) ===');
try {
  const result = parseChatResponse(invalidResponse);
  console.log('✗ Should have thrown an error!');
} catch (error) {
  if (error instanceof ChatResponseParseError) {
    console.log('✓ Correctly caught error:', error.message);
  } else {
    console.error('✗ Unexpected error type:', error);
  }
}

// Example 4: Using tryParseChatResponse (returns null on error)
console.log('\n=== Test 4: Using tryParseChatResponse (safe parsing) ===');
const result1 = tryParseChatResponse(validResponse);
console.log('Valid response result:', result1 ? '✓ Parsed' : '✗ Failed');

const result2 = tryParseChatResponse(invalidResponse);
console.log('Invalid response result:', result2 === null ? '✓ Returned null' : '✗ Should be null');

// Example 5: Malformed JSON
const malformedJson = `{"reply": "not a json string, just text"}`;

console.log('\n=== Test 5: Malformed inner JSON ===');
try {
  const result = parseChatResponse(malformedJson);
  console.log('✗ Should have thrown an error!');
} catch (error) {
  if (error instanceof ChatResponseParseError) {
    console.log('✓ Correctly caught error:', error.message);
  } else {
    console.error('✗ Unexpected error type:', error);
  }
}

console.log('\n=== All Tests Complete ===');
