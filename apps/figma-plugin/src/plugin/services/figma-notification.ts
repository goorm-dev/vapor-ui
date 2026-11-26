export const figmaNoticeService = {
    /* -------------------------------------------------------------------------------------------------
     * UI Notifications
     * -----------------------------------------------------------------------------------------------*/
    paletteCreating: () => {
        figma.notify('팔레트 섹션을 생성하는 중입니다... ⏳');
    },
    paletteCreated: () => {
        figma.notify('새로운 팔레트 섹션이 생성되었습니다! 🎨');
    },
    semanticPaletteCreated: () => {
        figma.notify('새로운 시맨틱 팔레트 섹션이 생성되었습니다! 🎨');
    },
    brandPaletteCreated: () => {
        figma.notify('새로운 브랜드 팔레트 섹션이 생성되었습니다! 🎨');
    },
    paletteCreateFailed: () => {
        figma.notify('팔레트 섹션 생성 중 오류가 발생했습니다 ❌');
    },
    semanticPaletteCreateFailed: () => {
        figma.notify('시맨틱 팔레트 섹션 생성 중 오류가 발생했습니다 ❌');
    },
    brandPaletteCreateFailed: () => {
        figma.notify('브랜드 팔레트 섹션 생성 중 오류가 발생했습니다 ❌');
    },

    /* -------------------------------------------------------------------------------------------------
     * Figma Variable Notifications
     * -----------------------------------------------------------------------------------------------*/
    variablesCreated: () => {
        figma.notify('Figma Variable 생성이 성공적으로 완료되었습니다! ✅');
    },
    variablesCreateFailed: () => {
        figma.notify('Figma Variable 생성 중 오류가 발생했습니다 ❌');
    },

    /* -------------------------------------------------------------------------------------------------
     * Generic Notifications
     * -----------------------------------------------------------------------------------------------*/
    success: (message: string) => {
        figma.notify(`${message} ✅`);
    },
    error: (message: string) => {
        figma.notify(`${message} ❌`);
    },
    info: (message: string) => {
        figma.notify(message);
    },
} as const;
