/**
 * Vercel Analytics 이벤트 상수 및 타입 정의
 */

export const ANALYTICS_EVENTS = {
    COPY_BUTTON_CLICK: 'copy_button_click',
} as const;

export const COPY_BUTTON_ACTIONS = {
    COPY_MARKDOWN: 'copy_markdown',
    VIEW_MARKDOWN: 'view_markdown',
    ASK_CLAUDE: 'ask_claude',
    ASK_CHATGPT: 'ask_chatgpt',
} as const;

export type CopyButtonAction = (typeof COPY_BUTTON_ACTIONS)[keyof typeof COPY_BUTTON_ACTIONS];

/**
 * 문서 URL에서 경로 추출
 * 예: /llms/components/button.md → /components/button
 */
export const extractDocPath = (markdownUrl: string): string => {
    try {
        const url = new URL(markdownUrl);
        return url.pathname.replace('/llms', '').replace('.md', '');
    } catch {
        return markdownUrl;
    }
};
