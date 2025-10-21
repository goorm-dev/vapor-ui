'use client';

import { Button } from '@vapor-ui/core';
import { CopyAsMarkdownOutlineIcon, CopyIcon } from '@vapor-ui/icons';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';

const cache = new Map<string, string>();

type CopyButtonProps = Omit<Button.Props, 'onClick' | 'disabled'> & {
    markdownUrl: string;
};

export const CopyButton = ({ markdownUrl, ...props }: CopyButtonProps) => {
    const handleCopyContent = async (url: string) => {
        const cached = cache.get(url);
        if (cached) return navigator.clipboard.writeText(cached);

        await navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': fetch(url).then(async (res) => {
                    const content = await res.text();
                    cache.set(url, content);

                    return content;
                }),
            }),
        ]);
    };

    const [checked, onClick] = useCopyButton(() => handleCopyContent(markdownUrl));

    return (
        <Button color="secondary" variant="outline" onClick={onClick} {...props}>
            {checked ? <CopyAsMarkdownOutlineIcon /> : <CopyIcon />}
            Copy as Markdown
        </Button>
    );
};
