export function parseLlmJson(content: string): unknown {
    const trimmed = content.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    let jsonContent = fenced ? fenced[1].trim() : trimmed;

    if (!jsonContent.startsWith('{') && !jsonContent.startsWith('[')) {
        const match = jsonContent.match(/[{[][\s\S]*[}\]]/);
        if (match) jsonContent = match[0];
    }

    return JSON.parse(jsonContent);
}
