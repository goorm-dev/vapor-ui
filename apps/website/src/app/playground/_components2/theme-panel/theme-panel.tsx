'use client';

import { useEffect, useState } from 'react';

import { Badge, Card, Text } from '@vapor-ui/core';

import { SectionColor } from '../section-color';
import { SectionMode } from '../section-mode';
import { SectionRadius } from '../section-radius';
import { SectionScaling } from '../section-scaling';

const ThemePanel = () => {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const clickV = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) return;
            if (e.key === 'v' || e.key === 'ㅍ') setOpen((prev) => !prev);
        };

        document.addEventListener('keydown', clickV);
        return () => document.removeEventListener('keydown', clickV);
    }, []);

    return (
        <Card.Root
            className={`
                fixed right-4 top-8 
                flex flex-col justify-center
                shadow-[0px_4px_16px_0px_rgba(0,0,0,0.2)]
                z-[9999] overflow-hidden
                transform transition-transform duration-200 ease-in
                ${open ? 'translate-x-0' : 'translate-x-[105%]'}
            `}
        >
            <Card.Header className="flex justify-between items-center border-b-0">
                <Text typography="heading5">Theme Setting</Text>

                <div className="flex items-center gap-[var(--vapor-size-space-050)]">
                    <Badge color="hint">V</Badge>
                    <Text typography="subtitle2" foreground="hint-100">
                        로 열기/닫기
                    </Text>
                </div>
            </Card.Header>

            <Card.Body className="pt-0">
                <div className="flex flex-col gap-[var(--vapor-size-space-250)]">
                    <SectionColor />
                    <SectionMode />
                    <SectionRadius />
                    <SectionScaling />
                </div>
            </Card.Body>
        </Card.Root>
    );
};

export { ThemePanel };
