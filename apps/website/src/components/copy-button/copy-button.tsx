'use client';

import React, { useState } from 'react';

import { Button, type ButtonProps } from '@vapor-ui/core';
import { CheckCircleIcon, CopyIcon } from '@vapor-ui/icons';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';

const cache = new Map<string, string>();

interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled'> {
    markdownUrl: string;
}

const CopyButton = ({ markdownUrl, ...props }: CopyButtonProps) => {
    const [isLoading, setLoading] = useState(false);
    const [checked, onClick] = useCopyButton(async () => {
        const cached = cache.get(markdownUrl);
        if (cached) return navigator.clipboard.writeText(cached);

        setLoading(true);

        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/plain': fetch(markdownUrl).then(async (res) => {
                        const content = await res.text();
                        cache.set(markdownUrl, content);

                        return content;
                    }),
                }),
            ]);
        } finally {
            setLoading(false);
        }
    });

    return (
        <Button
            color="secondary"
            variant="outline"
            disabled={isLoading}
            onClick={onClick}
            {...props}
        >
            {checked ? <CheckCircleIcon /> : <CopyIcon />}
            Copy as Markdown
        </Button>
    );
};

export default CopyButton;
