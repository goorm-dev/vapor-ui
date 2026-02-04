/**
 * Vercel Analytics 이벤트 상수 및 타입 정의
 */

export const COPY_BUTTON_ACTIONS = {
    COPY_MARKDOWN: 'copy_markdown',
    VIEW_MARKDOWN: 'view_markdown',
    ASK_CLAUDE: 'ask_claude',
    ASK_CHATGPT: 'ask_chatgpt',
} as const;

export type CopyButtonAction = (typeof COPY_BUTTON_ACTIONS)[keyof typeof COPY_BUTTON_ACTIONS];

/**
 * 문서 URL에서 컴포넌트 이름 추출
 * 예: /llms/components/button.md → button
 */
export const extractComponentName = (markdownUrl: string): string => {
    try {
        const url = new URL(markdownUrl);
        const pathname = url.pathname.replace('/llms', '').replace('.md', '');
        const segments = pathname.split('/').filter(Boolean);
        return segments[segments.length - 1] || 'unknown';
    } catch {
        return 'unknown';
    }
};

/**
 * CopyButton 이벤트 이름 생성
 * 예: copy_markdown:button, ask_claude:dialog
 */
export const createCopyButtonEventName = (action: CopyButtonAction, markdownUrl: string): string => {
    const componentName = extractComponentName(markdownUrl);
    return `${action}:${componentName}`;
};
