import { callBatch } from '~/batch-call';
import { DEFAULT_TRANSLATION_MODEL } from '~/defaults';
import { type TranslationUnit, getTranslationUnitKey, getUnitOwnerName } from '~/domain';

const SYSTEM_PROMPT = `You are a professional Korean translator for design-system API documentation. Respond ONLY with valid JSON.

Translate each source string to natural Korean while preserving component names, prop names, enum values, markdown, inline code, URLs, token names, and TypeScript identifiers exactly.

Identifier preservation (must keep the original English spelling exactly — never translate, romanize, or normalize):
- PascalCase component names (Breadcrumb, Button, TextInput)
- camelCase prop names (asChild, onClick, isDisabled)
- quoted enum values ("sm", "ghost", "md")
- HTML/ARIA attributes (aria-label, data-state)
- Design tokens and TypeScript identifiers

Style rules (translations are evaluated against these — write the Korean text so it passes on the first pass):
- Use 합쇼체 (~합니다, ~입니다). Do not use 해요체 or 반말.
- Prefer active voice. The subject should be the component or the developer, not an abstract noun.
- Avoid 번역투. The following patterns are flagged as Fluency/Unnatural phrasing — do NOT produce them:
    "~를 제어합니다"         → write "~를 지정합니다" or "~를 설정합니다" instead
    "~를 수행합니다"         → use a direct verb (e.g. "~합니다", "~을 처리합니다")
    "~에 적용되는"           → write "~에 줄" or rephrase with an active verb
    "~를 반환하는 함수입니다" → drop the trailing 이다 (e.g. "~를 반환합니다")
    abstract-noun subjects   → rewrite with the component or developer as the subject
- Translate prop/component descriptions as instructions to the developer ("…을 지정합니다", "…을 설정합니다"), not as third-person reports about the API.

Each unit carries the name of the component it belongs to. Echo every unit's id back exactly as given.

Return exactly this JSON shape:
{"translations":[{"id":"12:component.description","translated":"Korean translation"}]}`;

interface TranslationResponseItem {
    id: string;
    translated: string;
}

const TRANSLATION_RESPONSE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['translations'],
    properties: {
        translations: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'translated'],
                properties: {
                    id: { type: 'string' },
                    translated: { type: 'string' },
                },
            },
        },
    },
};

export async function translateUnits(units: TranslationUnit[]): Promise<Map<string, string>> {
    if (units.length === 0) {
        return new Map();
    }

    const request = {
        units: units.map((unit) => ({
            id: getTranslationUnitKey(unit),
            kind: unit.kind,
            ownerName: getUnitOwnerName(unit),
            componentName: unit.componentDisplayName,
            source: unit.source,
        })),
    };

    const result = await callBatch<TranslationResponseItem>(
        'llm-translation',
        SYSTEM_PROMPT,
        DEFAULT_TRANSLATION_MODEL,
        { name: 'translation_response', schema: TRANSLATION_RESPONSE_SCHEMA },
        request,
        units.map(getTranslationUnitKey),
        'translations',
    );
    if (!result.ok) throw new Error(result.reason);

    for (const item of result.value.values()) {
        if (item.translated.trim().length === 0) {
            throw new Error(`Empty translation for id: ${item.id}`);
        }
    }
    return new Map([...result.value].map(([id, item]) => [id, item.translated]));
}
