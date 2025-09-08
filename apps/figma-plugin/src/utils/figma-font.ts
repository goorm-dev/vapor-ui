import { Logger } from '~/services/logger';

const FONT_CONFIG = {
    DEFAULT_FAMILY: 'Pretendard',
    FALLBACK_FAMILY: 'Inter',
    STYLE: 'Regular',
} as const;

/**
 * 기본 폰트를 로드하는 유틸리티 함수
 * Pretendard를 우선 시도하고, 실패 시 Inter 폰트로 폴백
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
