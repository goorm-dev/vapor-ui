export function parseLlmJson(content: string): unknown {
    const trimmed = content.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    const jsonContent = fenced ? fenced[1].trim() : trimmed;

    return JSON.parse(jsonContent);
}
