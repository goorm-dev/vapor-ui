'use client';

import { useEffect, useRef, useState } from 'react';

import { Popover } from '@base-ui/react';
import { Badge, Button, Card, Text } from '@vapor-ui/core';
import {
    generateColorCSS,
    generateCompleteCSS,
    generateRadiusCSS,
    generateScalingCSS,
} from '@vapor-ui/css-generator';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { useClipboard } from '~/hooks/use-clipboard';
import { CustomThemeProvider, useCustomTheme } from '~/providers';

import { SectionColor } from '../section-color';
import { SectionMode } from '../section-mode';
import { SectionRadius } from '../section-radius';
import { SectionScaling } from '../section-scaling';

const ThemePanelContent = () => {
    const { currentConfig } = useCustomTheme();
    const { copyToClipboard, copied, reset } = useClipboard({
        onSuccess: () => {
            setTimeout(() => {
                reset();
            }, 1000);
        },
        onError: (error) => {
            console.error('Failed to copy theme:', error);
        },
    });

    const hasAnyConfig =
        Boolean(currentConfig.colors) ||
        Boolean(currentConfig.scaling) ||
        Boolean(currentConfig.radius);

    const handleCopyTheme = async () => {
        const { colors, scaling, radius } = currentConfig;

        let css = '';

        if (colors && scaling && radius) {
            css = generateCompleteCSS({
                colors,
                scaling,
                radius,
            });
        } else {
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

        await copyToClipboard(css);
    };

    return (
        <Card.Root className="bg-v-overlay-100">
            <Card.Header className="flex justify-between items-center border-b-0 flex-shrink-0">
                <Popover.Title render={<Text typography="heading5">Theme Setting</Text>} />

                <div className="flex items-center gap-v-50">
                    <Badge colorPalette="hint">V</Badge>
                    <Text typography="subtitle2" foreground="hint-100">
                        로 열기/닫기
                    </Text>
                </div>
            </Card.Header>

            <Card.Body className="max-h-[60vh] overflow-y-auto [--scroll-shadow-size:20px] [mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]">
                <div className="flex flex-col gap-v-250">
                    <SectionMode />
                    <SectionColor />
                    <SectionRadius />
                    <SectionScaling />
                </div>
            </Card.Body>
            <Card.Footer className="flex-shrink-0">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={handleCopyTheme}
                    disabled={!hasAnyConfig}
                >
                    {copied ? <ConfirmOutlineIcon /> : 'Copy Theme'}
                </Button>
            </Card.Footer>
        </Card.Root>
    );
};

const ThemePanel = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [liveMessage, setLiveMessage] = useState('');

    const anchorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const clickV = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) return;
            if (e.key === 'v' || e.key === 'ㅍ')
                setIsOpen((prevOpen) => {
                    setLiveMessage(
                        prevOpen
                            ? '테마 설정 패널이 숨겨졌습니다.'
                            : '테마 설정 패널이 나타났습니다.',
                    );
                    return !prevOpen;
                });
        };

        document.addEventListener('keydown', clickV);
        return () => document.removeEventListener('keydown', clickV);
    }, []);

    return (
        <CustomThemeProvider>
            <div
                id="theme-panel-anchor"
                ref={anchorRef}
                style={{
                    position: 'fixed',
                    top: '0',
                    right: '0',
                    width: '1rem',
                    height: '4rem',
                    background: 'transparent',
                }}
            />

            <div
                role="status"
                aria-live="polite"
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    margin: '-1px',
                    padding: '0',
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    border: '0',
                }}
            >
                {liveMessage}
            </div>
            <Popover.Root open={isOpen} modal="trap-focus">
                <Popover.Portal>
                    <Popover.Positioner
                        anchor={anchorRef}
                        side="bottom"
                        align="end"
                        alignOffset={16}
                        sideOffset={16}
                        positionMethod="fixed"
                    >
                        <Popover.Popup
                            className={`shadow-[0px_4px_16px_0px_rgba(0,0,0,0.2)] outline-none bg-transparent rounded-v-300 
                                transition-transform duration-300 ease-in-out 
                                data-[starting-style]:translate-x-full 
                                data-[ending-style]:translate-x-full`}
                        >
                            <ThemePanelContent />
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </CustomThemeProvider>
    );
};

export { ThemePanel };
