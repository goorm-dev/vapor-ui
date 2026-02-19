'use client';

import { useCallback, useMemo, useState } from 'react';

import { Button, HStack, IconButton, Menu } from '@vapor-ui/core';
import {
    ChevronDownOutlineIcon,
    ConfirmOutlineIcon,
    CopyAsMarkdownOutlineIcon,
    OpenInNewOutlineIcon,
} from '@vapor-ui/icons';
import { track } from '@vercel/analytics';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';

import {
    COPY_BUTTON_ACTIONS,
    type CopyButtonAction,
    createCopyButtonEventName,
} from '~/constants/analytics';

import { AnthropicIcon, OpenAIIcon } from './copy-button.icons';

const markdownIcon = <CopyAsMarkdownOutlineIcon aria-hidden="true" width={16} height={16} />;
const anthropicIcon = <AnthropicIcon />;
const openAIIcon = <OpenAIIcon />;

const cache = new Map<string, string>();

const TRUSTED_DOMAINS = ['vapor-ui.goorm.io', 'localhost'] as const;

const isValidMarkdownUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return TRUSTED_DOMAINS.some(
            (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`),
        );
    } catch {
        return false;
    }
};

type CopyButtonProps = {
    markdownUrl: string;
};

const LLM_URLS = {
    claude: 'https://claude.ai/new',
    chatgpt: 'https://chat.openai.com/',
} as const;

const LLM_PROMPT_MESSAGE = ' 문서를 읽고 질문에 답해줘.';

const openLLMChat = (llmType: keyof typeof LLM_URLS, docUrl: string) => {
    if (!isValidMarkdownUrl(docUrl)) {
        console.error('Invalid doc URL:', docUrl);
        return;
    }

    const prompt = encodeURIComponent(`${docUrl}${LLM_PROMPT_MESSAGE}`);
    const url = `${LLM_URLS[llmType]}?q=${prompt}`;
    window.open(url, '_blank');
};

const trackCopyButtonEvent = (action: CopyButtonAction, markdownUrl: string) => {
    const eventName = createCopyButtonEventName(action, markdownUrl);
    track(eventName);
};


export const CopyButton = ({ markdownUrl }: CopyButtonProps) => {
    const [checked, onCopy] = useCopyButton(() => handleCopyContent());
    const [isLoading, setIsLoading] = useState(false);

    const handleCopyContent = async () => {
        trackCopyButtonEvent(COPY_BUTTON_ACTIONS.COPY_MARKDOWN, markdownUrl);

        const cached = cache.get(markdownUrl);
        if (cached) {
            await navigator.clipboard.writeText(cached);
            return;
        }

        if (!isValidMarkdownUrl(markdownUrl)) {
            console.error('Invalid markdown URL:', markdownUrl);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(markdownUrl);
            const content = await res.text();
            cache.set(markdownUrl, content);
            await navigator.clipboard.writeText(content);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMenuItemClick = useCallback(
        (action: CopyButtonAction, handler: () => void) => {
            if (!isValidMarkdownUrl(markdownUrl)) return;
            trackCopyButtonEvent(action, markdownUrl);
            handler();
        },
        [markdownUrl],
    );

    const menuItems = useMemo(
        () => [
            {
                label: '마크다운으로 보기',
                icon: markdownIcon,
                action: COPY_BUTTON_ACTIONS.VIEW_MARKDOWN,
                handler: () => window.open(markdownUrl, '_blank'),
                isExternal: true,
            },
            {
                label: 'Claude에게 질문하기',
                icon: anthropicIcon,
                action: COPY_BUTTON_ACTIONS.ASK_CLAUDE,
                handler: () => openLLMChat('claude', markdownUrl),
                isExternal: true,
            },
            {
                label: 'ChatGPT에게 질문하기',
                icon: openAIIcon,
                action: COPY_BUTTON_ACTIONS.ASK_CHATGPT,
                handler: () => openLLMChat('chatgpt', markdownUrl),
                isExternal: true,
            },
        ],
        [markdownUrl],
    );

    return (
        <HStack
            role="group"
            aria-label="마크다운 도구"
            className="rounded-md shadow-[inset_0_0_0_1px_var(--vapor-color-border-secondary)] w-fit gap-0"
        >
            <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {checked ? '복사 완료' : ''}
            </span>
            <Button
                colorPalette="secondary"
                variant="ghost"
                onClick={onCopy}
                disabled={isLoading}
                aria-busy={isLoading}
                className="rounded-r-none"
            >
                {checked ? (
                    <ConfirmOutlineIcon aria-hidden="true" />
                ) : (
                    <CopyAsMarkdownOutlineIcon aria-hidden="true" />
                )}
                마크다운 복사
            </Button>
            <span aria-hidden="true" className="w-px bg-v-gray-200 self-stretch" />
            <Menu.Root>
                <Menu.Trigger
                    render={
                        <IconButton
                            colorPalette="secondary"
                            variant="ghost"
                            aria-label="더 많은 도구"
                            disabled={isLoading}
                            className="rounded-l-none"
                        />
                    }
                >
                    <ChevronDownOutlineIcon aria-hidden="true" />
                </Menu.Trigger>
                <Menu.Popup className="min-w-[200px]">
                    {menuItems.map(({ label, action, handler, icon, isExternal }) => (
                        <Menu.Item key={label} onClick={() => handleMenuItemClick(action, handler)}>
                            {icon}
                            {label}
                            {isExternal && (
                                <>
                                    <span className="sr-only">(새 탭에서 열림)</span>
                                    <OpenInNewOutlineIcon
                                        aria-hidden="true"
                                        width={16}
                                        height={16}
                                        className="ml-auto"
                                    />
                                </>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Popup>
            </Menu.Root>
        </HStack>
    );
};
