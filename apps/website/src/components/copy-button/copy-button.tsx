'use client';

import React, { useState } from 'react';

import { Button } from '@vapor-ui/core';
import { CheckCircleIcon, CopyIcon } from '@vapor-ui/icons';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';

const cache = new Map<string, string>();

const CopyButton = ({ markdownUrl }: { markdownUrl: string }) => {
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
        <Button color="secondary" variant="outline" disabled={isLoading} onClick={onClick}>
            {checked ? <CheckCircleIcon /> : <CopyIcon />}
            Copy Markdown
        </Button>
    );
};

export default CopyButton;
