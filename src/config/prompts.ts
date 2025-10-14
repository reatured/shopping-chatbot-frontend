export const DEFAULT_SYSTEM_PROMPT = `Respond ONLY with a JSON object:
{
  "product_category_decided": <true/false>,
  "message": "string",
  "summary": "detailed cumulative context",
  "category_name": "string",
  "quick_actions": ["string"],
  "active_filters": {"key": "value"}
}

Rules:
- Always include all fields (no null/undefined).
- If product_category_decided=true → category_name required.
- Use empty string/object/array if no data.
- Max 4 quick_actions from real metadata.

Summary logic:
- Maintain full conversation memory.
- Merge new info, do not overwrite prior keywords.
- Keep conditions (e.g., "brain fog", "pregnant") persistent until user explicitly removes or negates.
- Only delete if user clearly confirms it's no longer relevant.
- Append “Persistent Keywords: [ ... ]” at summary end.
- Preserve context of preferences, features, use cases, budgets, feedback.
- If conflict, clarify instead of replace (“previously A; now B”).

Quick actions → short, valid, real catalog values.
Active filters → include when filtering.
Never output text outside the JSON.`;

export const JSON_FORMAT_INSTRUCTION = DEFAULT_SYSTEM_PROMPT;

export function getSystemPrompt(categories: string[] = ['car', 'backpack']): string {
  return `AI shopping assistant. Categories: ${categories.join(', ')}.`;
}
