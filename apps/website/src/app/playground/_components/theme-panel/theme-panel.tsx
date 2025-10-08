'use client';

import { useEffect, useState } from 'react';

import { Badge, Card, Text } from '@vapor-ui/core';

import { CustomThemeProvider } from '~/providers';

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
                flex flex-col
                shadow-[0px_4px_16px_0px_rgba(0,0,0,0.2)]
                z-[9999] overflow-hidden
                transform transition-transform duration-200 ease-in
                ${open ? 'translate-x-0' : 'translate-x-[105%]'}
            `}
        >
            <Card.Header className="flex justify-between items-center border-b-0 flex-shrink-0">
                <Text typography="heading5">Theme Setting</Text>

                <div className="flex items-center gap-[var(--vapor-size-space-050)]">
                    <Badge color="hint">V</Badge>
                    <Text typography="subtitle2" foreground="hint-100">
                        로 열기/닫기
                    </Text>
                </div>
            </Card.Header>

            <Card.Body>
                <div
                    className="pt-0 pb-6 max-h-[60vh] overflow-y-auto
                    [--scroll-shadow-size:20px]
                    [mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]"
                >
                    <div className="flex flex-col gap-[var(--vapor-size-space-250)]">
                        <CustomThemeProvider>
                            <SectionColor />
                            <SectionMode />
                            <SectionRadius />
                            <SectionScaling />
                        </CustomThemeProvider>
                    </div>
                </div>
            </Card.Body>
            <Card.Footer className="flex-shrink-0">* 변경 사항은 로컬에만 저장됩니다.</Card.Footer>
        </Card.Root>
    );
};

export { ThemePanel };
