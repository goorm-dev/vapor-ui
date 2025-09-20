import { Logger } from '~/common/logger';

const FONT_CONFIG = {
    DEFAULT_FAMILY: 'Pretendard',
    FALLBACK_FAMILY: 'Inter',
    STYLE: 'Regular',
} as const;

/**
 * Attempts to load `Pretendard` first,
 * and falls back to `Inter` if the first attempt fails.
 */
export async function loadDefaultFont(): Promise<FontName> {
    const defaultFont: FontName = {
        family: FONT_CONFIG.DEFAULT_FAMILY,
        style: FONT_CONFIG.STYLE,
    };
    const fallbackFont: FontName = {
        family: FONT_CONFIG.FALLBACK_FAMILY,
        style: FONT_CONFIG.STYLE,
    };

    try {
        Logger.font.loading(FONT_CONFIG.DEFAULT_FAMILY);
        await figma.loadFontAsync(defaultFont);
        Logger.font.loaded(FONT_CONFIG.DEFAULT_FAMILY);
        return defaultFont;
    } catch (error) {
        Logger.font.fallback(FONT_CONFIG.DEFAULT_FAMILY, FONT_CONFIG.FALLBACK_FAMILY, error);

        try {
            Logger.font.loading(FONT_CONFIG.FALLBACK_FAMILY);
            await figma.loadFontAsync(fallbackFont);
            Logger.font.loaded(FONT_CONFIG.FALLBACK_FAMILY);
            return fallbackFont;
        } catch (fallbackError) {
            Logger.font.error(
                `대체 폰트 "${FONT_CONFIG.FALLBACK_FAMILY}" 로드 실패`,
                fallbackError,
            );
            throw new Error('사용 가능한 폰트를 찾을 수 없습니다.');
        }
    }
}
