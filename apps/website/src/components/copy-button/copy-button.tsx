'use client';

import { useMemo, useState } from 'react';

import { Button, HStack, IconButton, Menu } from '@vapor-ui/core';
import {
    ChevronDownOutlineIcon,
    ConfirmOutlineIcon,
    CopyAsMarkdownOutlineIcon,
    OpenInNewOutlineIcon,
} from '@vapor-ui/icons';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';

import { AnthropicIcon, OpenAIIcon } from './copy-button.icons';

const markdownIcon = <CopyAsMarkdownOutlineIcon width={16} height={16} />;
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

export const CopyButton = ({ markdownUrl }: CopyButtonProps) => {
    const [checked, onCopy] = useCopyButton(() => handleCopyContent());
    const [isLoading, setIsLoading] = useState(false);

    const handleCopyContent = async () => {
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

    const menuItems = useMemo(
        () => [
            {
                label: '마크다운으로 보기',
                icon: markdownIcon,
                onClick: () => {
                    if (isValidMarkdownUrl(markdownUrl)) {
                        window.open(markdownUrl, '_blank');
                    }
                },
                isExternal: true,
            },
            {
                label: 'Claude에게 질문하기',
                icon: anthropicIcon,
                onClick: () => openLLMChat('claude', markdownUrl),
                isExternal: true,
            },
            {
                label: 'ChatGPT에게 질문하기',
                icon: openAIIcon,
                onClick: () => openLLMChat('chatgpt', markdownUrl),
                isExternal: true,
            },
        ],
        [markdownUrl],
    );

    return (
        <HStack
            gap="0"
            className="rounded-md shadow-[inset_0_0_0_1px_var(--vapor-color-border-secondary)] w-fit"
        >
            <Button
                colorPalette="secondary"
                variant="ghost"
                onClick={onCopy}
                disabled={isLoading}
                className="rounded-r-none"
            >
                {checked ? <ConfirmOutlineIcon /> : <CopyAsMarkdownOutlineIcon />}
                마크다운 복사
            </Button>
            <span className="w-px bg-v-gray-200 self-stretch" />
            <Menu.Root>
                <Menu.Trigger
                    render={
                        <IconButton
                            colorPalette="secondary"
                            variant="ghost"
                            aria-label="더보기"
                            disabled={isLoading}
                            className="rounded-l-none"
                        />
                    }
                >
                    <ChevronDownOutlineIcon />
                </Menu.Trigger>
                <Menu.Popup className="min-w-[200px]">
                    {menuItems.map((item) => (
                        <Menu.Item key={item.label} onClick={item.onClick}>
                            {item.icon}
                            {item.label}
                            {item.isExternal && (
                                <OpenInNewOutlineIcon width={16} height={16} className="ml-auto" />
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Popup>
            </Menu.Root>
        </HStack>
    );
};
