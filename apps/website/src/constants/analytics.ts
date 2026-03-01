/**
 * Vercel Analytics event constants and type definitions
 */

export const COPY_BUTTON_ACTIONS = {
    COPY_MARKDOWN: 'copy_markdown',
    VIEW_MARKDOWN: 'view_markdown',
    ASK_CLAUDE: 'ask_claude',
    ASK_CHATGPT: 'ask_chatgpt',
} as const;

export type CopyButtonAction = (typeof COPY_BUTTON_ACTIONS)[keyof typeof COPY_BUTTON_ACTIONS];

/**
 * Extracts docs path from document URL
 * Example: /docs/components/navigation-menu.mdx → components/navigation-menu
 */
export const extractComponentName = (markdownUrl: string): string => {
    try {
        const url = new URL(markdownUrl);
        const pathname = url.pathname
            .split('/')
            .slice(-2)
            .join('/')
            .replace(/\.mdx?$/, '');
        const segments = pathname.split('/').filter(Boolean);
        return segments.join('/') || 'unknown';
    } catch {
        return 'unknown';
    }
};

/**
 * Creates CopyButton event name
 * Example: copy_markdown:components/navigation-menu, ask_claude:components/button
 */
export const createCopyButtonEventName = (
    action: CopyButtonAction,
    markdownUrl: string,
): string => {
    const componentName = extractComponentName(markdownUrl);
    return `${action}:${componentName}`;
};
