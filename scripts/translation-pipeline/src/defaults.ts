import type { TranslationConfig } from '~/types';

export const DEFAULT_TRANSLATION_MODEL = 'claude-sonnet-4-6';
export const DEFAULT_VALIDATION_MODEL = 'claude-opus-4-7';
export const DEFAULT_POSTPROCESS_MODEL = 'claude-opus-4-7';

export function defaultTranslationConfig(): TranslationConfig {
    return {
        skipCache: false,
        targetLocale: 'ko',
        llm: {
            translationModel: DEFAULT_TRANSLATION_MODEL,
            validationModel: DEFAULT_VALIDATION_MODEL,
            postprocessModel: DEFAULT_POSTPROCESS_MODEL,
        },
    };
}
