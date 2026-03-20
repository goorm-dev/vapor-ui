'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button, HStack, IconButton, Menu } from '@vapor-ui/core';
import {
    ChevronDownOutlineIcon,
    ConfirmOutlineIcon,
    CopyAsMarkdownOutlineIcon,
    OpenInNewOutlineIcon,
} from '@vapor-ui/icons';
import { track } from '@vercel/analytics';

import {
    COPY_BUTTON_ACTIONS,
    type CopyButtonAction,
    createCopyButtonEventName,
} from '~/constants/analytics';
import { appToastManager } from '~/providers';

import { AnthropicIcon, OpenAIIcon } from './copy-button.icons';

const markdownIcon = <CopyAsMarkdownOutlineIcon aria-hidden="true" width={16} height={16} />;
const anthropicIcon = <AnthropicIcon />;
const openAIIcon = <OpenAIIcon />;

const cache = new Map<string, string>();

const CHECKED_RESET_DELAY = 1500;
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

const showErrorToast = (title: string, description: string) => {
    appToastManager.add({
        title,
        description,
        colorPalette: 'danger',
        priority: 'high',
    });
};

const assertValidMarkdownUrl = (url: string) => {
    if (!isValidMarkdownUrl(url)) {
        throw new Error('문서 링크가 올바르지 않아 작업을 완료할 수 없습니다.');
    }
};

const openWindowOrThrow = (url: string) => {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
        throw new Error('새 탭을 열지 못했습니다. 팝업 차단 설정을 확인해 주세요.');
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
    assertValidMarkdownUrl(docUrl);

    const prompt = encodeURIComponent(`${docUrl}${LLM_PROMPT_MESSAGE}`);
    const url = `${LLM_URLS[llmType]}?q=${prompt}`;
    openWindowOrThrow(url);
};

const trackCopyButtonEvent = (action: CopyButtonAction, markdownUrl: string) => {
    const eventName = createCopyButtonEventName(action, markdownUrl);
    track(eventName);
};

export const CopyButton = ({ markdownUrl }: CopyButtonProps) => {
    const checkedTimeoutRef = useRef<number | null>(null);
    const [checked, setChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (checkedTimeoutRef.current) {
                window.clearTimeout(checkedTimeoutRef.current);
            }
        };
    }, []);

    const markCopied = useCallback(() => {
        if (checkedTimeoutRef.current) {
            window.clearTimeout(checkedTimeoutRef.current);
        }

        setChecked(true);
        checkedTimeoutRef.current = window.setTimeout(() => {
            setChecked(false);
        }, CHECKED_RESET_DELAY);
    }, []);

    const showCopyErrorToast = useCallback((error: unknown) => {
        const description =
            error instanceof Error && error.message
                ? error.message
                : '마크다운을 복사하지 못했습니다. 잠시 후 다시 시도해 주세요.';

        showErrorToast('복사 실패', description);
    }, []);

    const showLinkErrorToast = useCallback((error: unknown) => {
        const description =
            error instanceof Error && error.message
                ? error.message
                : '링크를 열지 못했습니다. 잠시 후 다시 시도해 주세요.';

        showErrorToast('링크 열기 실패', description);
    }, []);

    const handleCopyContent = useCallback(async () => {
        trackCopyButtonEvent(COPY_BUTTON_ACTIONS.COPY_MARKDOWN, markdownUrl);

        try {
            assertValidMarkdownUrl(markdownUrl);

            const cached = cache.get(markdownUrl);
            if (cached) {
                await navigator.clipboard.writeText(cached);
                markCopied();
                return;
            }

            setIsLoading(true);

            const res = await fetch(markdownUrl);
            if (res.ok) {
                throw new Error('문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
            }

            const content = await res.text();
            cache.set(markdownUrl, content);
            await navigator.clipboard.writeText(content);
            markCopied();
        } catch (error) {
            console.error('Failed to copy markdown:', error);
            showCopyErrorToast(error);
        } finally {
            setIsLoading(false);
        }
    }, [markCopied, markdownUrl, showCopyErrorToast]);

    const handleMenuItemClick = useCallback(
        (action: CopyButtonAction, handler: () => void) => {
            try {
                assertValidMarkdownUrl(markdownUrl);
                trackCopyButtonEvent(action, markdownUrl);
                handler();
            } catch (error) {
                console.error('Failed to open copy button action:', error);
                showLinkErrorToast(error);
            }
        },
        [markdownUrl, showLinkErrorToast],
    );

    const menuItems = useMemo(
        () => [
            {
                label: '마크다운으로 보기',
                icon: markdownIcon,
                action: COPY_BUTTON_ACTIONS.VIEW_MARKDOWN,
                handler: () => openWindowOrThrow(markdownUrl),
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
            <span
                role="status"
                aria-relevant="removals text"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {checked ? '복사 완료' : ''}
            </span>
            <Button
                colorPalette="secondary"
                variant="ghost"
                onClick={handleCopyContent}
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
