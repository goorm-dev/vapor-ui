'use client';

import { useEffect, useState } from 'react';

import { Badge, Button, Card, Text } from '@vapor-ui/core';
import {
    generateColorCSS,
    generateCompleteCSS,
    generateRadiusCSS,
    generateScalingCSS,
} from '@vapor-ui/css-generator';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { CustomThemeProvider, useCustomTheme } from '~/providers';

import { SectionColor } from '../section-color';
import { SectionMode } from '../section-mode';
import { SectionRadius } from '../section-radius';
import { SectionScaling } from '../section-scaling';

const ThemePanelContent = () => {
    const [open, setOpen] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const { currentConfig } = useCustomTheme();

    // 최소 하나 이상의 설정이 있는지 확인
    const hasAnyConfig =
        Boolean(currentConfig.colors) ||
        Boolean(currentConfig.scaling) ||
        Boolean(currentConfig.radius);

    useEffect(() => {
        const clickV = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) return;
            if (e.key === 'v' || e.key === 'ㅍ') setOpen((prev) => !prev);
        };

        document.addEventListener('keydown', clickV);
        return () => document.removeEventListener('keydown', clickV);
    }, []);

    const handleCopyTheme = async () => {
        try {
            const { colors, scaling, radius } = currentConfig;

            let css = '';

            // 모든 설정이 있으면 generateCompleteCSS 사용
            if (colors && scaling && radius) {
                css = generateCompleteCSS({
                    colors,
                    scaling,
                    radius,
                });
            } else {
                // 부분적인 설정만 있으면 개별 generator 사용
                const cssBlocks: string[] = [];

                if (colors) {
                    cssBlocks.push(generateColorCSS(colors));
                }

                if (scaling) {
                    cssBlocks.push(generateScalingCSS(scaling));
                }

                if (radius) {
                    cssBlocks.push(generateRadiusCSS(radius));
                }

                css = cssBlocks.join('\n\n');
            }

            // 클립보드에 복사
            await navigator.clipboard.writeText(css);

            // 아이콘 표시
            setIsCopied(true);

            // 1초 후 원래 상태로 복귀
            setTimeout(() => {
                setIsCopied(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to copy theme:', error);
        }
    };

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
                        <SectionMode />
                        <SectionColor />
                        <SectionRadius />
                        <SectionScaling />
                    </div>
                </div>
            </Card.Body>
            <Card.Footer className="flex-shrink-0">
                <Button stretch size="lg" onClick={handleCopyTheme} disabled={!hasAnyConfig}>
                    {isCopied ? <ConfirmOutlineIcon /> : 'Copy Theme'}
                </Button>
            </Card.Footer>
        </Card.Root>
    );
};

const ThemePanel = () => {
    return (
        <CustomThemeProvider>
            <ThemePanelContent />
        </CustomThemeProvider>
    );
};

export { ThemePanel };
