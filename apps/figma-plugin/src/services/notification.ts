/**
 * Figma 플러그인 알림 메시지 관리 서비스
 * 모든 알림 메시지를 중앙에서 관리하여 일관성을 유지합니다.
 */
export const NotificationService = {
    /**
     * 팔레트 생성 성공 알림
     */
    paletteCreated: () => {
        figma.notify('새로운 팔레트 섹션이 생성되었습니다! 🎨');
    },

    /**
     * 시맨틱 팔레트 생성 성공 알림
     */
    semanticPaletteCreated: () => {
        figma.notify('새로운 시맨틱 팔레트 섹션이 생성되었습니다! 🎨');
    },

    /**
     * 팔레트 생성 실패 알림
     */
    paletteCreateFailed: () => {
        figma.notify('팔레트 섹션 생성 중 오류가 발생했습니다 ❌');
    },

    /**
     * 시맨틱 팔레트 생성 실패 알림
     */
    semanticPaletteCreateFailed: () => {
        figma.notify('시맨틱 팔레트 섹션 생성 중 오류가 발생했습니다 ❌');
    },

    /**
     * Figma 변수 생성 성공 알림
     */
    variablesCreated: () => {
        figma.notify('Figma 변수가 성공적으로 생성되었습니다! ✅');
    },

    /**
     * Figma 변수 생성 실패 알림
     */
    variablesCreateFailed: () => {
        figma.notify('Figma 변수 생성 중 오류가 발생했습니다 ❌');
    },

    /**
     * 일반적인 성공 알림
     */
    success: (message: string) => {
        figma.notify(`${message} ✅`);
    },

    /**
     * 일반적인 오류 알림
     */
    error: (message: string) => {
        figma.notify(`${message} ❌`);
    },

    /**
     * 일반적인 정보 알림
     */
    info: (message: string) => {
        figma.notify(message);
    },
} as const;
