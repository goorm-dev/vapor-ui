import { useMemo, useReducer, useState } from 'react';

import type { ThemeOptions, ThemeResult } from '@vapor-ui/color-generator';
import {
    generatePrimitiveColorPalette,
    getSemanticDependentTokens,
    validatePalette,
} from '@vapor-ui/color-generator';
import { Box, Button, HStack, Tabs, Text, VStack } from '@vapor-ui/core';
import { generateColorCSSFromTheme } from '@vapor-ui/css-generator';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Logger } from '~/common/logger';
import { postMessage } from '~/common/messages';
import { AccessibilityWarning } from '~/ui/components/accessibility-warning';
import { ConfirmDialog } from '~/ui/components/confirm-dialog';
import { LabeledInput } from '~/ui/components/labeled-input';

import { BasicTab } from './basic-tab';
import { BrandTab } from './brand-tab';
import type { ThemeAction } from './theme-draft';
import {
    confirmationFor,
    draftToOptions,
    flaggedCells,
    initialDraft,
    primaryName,
    themeDraftReducer,
    withoutHues,
} from './theme-draft';

type Generated = { theme: ThemeResult; error: null } | { theme: null; error: string };

const generate = (options: ThemeOptions): Generated => {
    try {
        return { theme: generatePrimitiveColorPalette(options), error: null };
    } catch (error) {
        return { theme: null, error: error instanceof Error ? error.message : String(error) };
    }
};

export const ColorSystemTab = () => {
    const [draft, dispatch] = useReducer(themeDraftReducer, initialDraft);
    const [pending, setPending] = useState<{ message: string; action: ThemeAction } | null>(null);
    const [collectionName, setCollectionName] = useState('Color Tokens');
    const [isCopying, setIsCopying] = useState(false);

    // Hue edits never move the baseline, so slider drags reuse it instead of generating twice.
    const baselineKey = JSON.stringify(draftToOptions(withoutHues(draft)));
    const baseline = useMemo(() => generate(JSON.parse(baselineKey)).theme, [baselineKey]);
    const { theme, error } = useMemo(() => generate(draftToOptions(draft)), [draft]);
    const checks = useMemo(() => (theme ? validatePalette(theme) : []), [theme]);
    const flags = useMemo(() => flaggedCells(checks), [checks]);
    const canExport = theme !== null && checks.every((check) => check.status !== 'fail');

    const request = (action: ThemeAction) => {
        const message = confirmationFor(draft, action);
        if (message) setPending({ message, action });
        else dispatch(action);
    };

    const handleExport = () => {
        if (!theme || !canExport) return;
        const semanticTokens = getSemanticDependentTokens(theme, primaryName(draft));
        Logger.info('Figma 내보내기 요청', { primary: primaryName(draft), collectionName });
        postMessage({ type: 'palette-generation-started', data: {} });
        postMessage({
            type: 'create-unified-palette-sections',
            data: { generatedTheme: theme, semanticTokens },
        });
        postMessage({
            type: 'create-unified-figma-variables',
            data: { generatedTheme: theme, collectionName },
        });
    };

    const handleCopyCssVariables = async () => {
        if (isCopying || !theme) return;
        setIsCopying(true);
        try {
            const css = generateColorCSSFromTheme(theme, primaryName(draft));
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(css);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = css;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setTimeout(() => setIsCopying(false), 2000);
        } catch (copyError) {
            Logger.error('CSS 복사 실패', copyError);
            setIsCopying(false);
        }
    };

    const tabProps = { draft, theme, baseline, flags, request };

    return (
        <VStack $css={{ gap: '$300' }}>
            <Tabs.Root defaultValue="basic">
                <Tabs.List>
                    <Tabs.Button value="basic">베이직 컬러</Tabs.Button>
                    <Tabs.Button value="brand">브랜드</Tabs.Button>
                </Tabs.List>
                <Tabs.Panel value="basic" className="pt-3">
                    <BasicTab {...tabProps} />
                </Tabs.Panel>
                <Tabs.Panel value="brand" className="pt-3">
                    <BrandTab {...tabProps} />
                </Tabs.Panel>
            </Tabs.Root>

            <VStack
                $css={{ gap: '$200' }}
                className="sticky bottom-0 pt-3 pb-1 bg-white border-t border-gray-300"
            >
                {error && (
                    <Box
                        role="alert"
                        className="p-3 bg-v-red-50 border border-v-red-200 rounded-lg"
                    >
                        <Text typography="body3" foreground="danger-100">
                            팔레트 생성 실패: {error}
                        </Text>
                    </Box>
                )}
                <Box className="max-h-40 overflow-y-auto">
                    <AccessibilityWarning checks={checks} />
                </Box>
                <LabeledInput
                    label="Collection Name"
                    value={collectionName}
                    onChange={setCollectionName}
                    placeholder="Enter collection name"
                />
                <HStack $css={{ gap: '$200' }}>
                    <Button onClick={handleExport} disabled={!canExport} className="flex-1">
                        Figma로 내보내기
                    </Button>
                    <Button
                        onClick={handleCopyCssVariables}
                        variant="outline"
                        disabled={isCopying || !theme}
                        className="flex-1"
                    >
                        {isCopying ? <ConfirmOutlineIcon /> : 'Copy CSS Variables'}
                    </Button>
                </HStack>
                {!canExport && theme && (
                    <Text typography="body4" foreground="danger-100">
                        FAIL 검사가 남아 있으면 내보낼 수 없어요.
                    </Text>
                )}
            </VStack>

            <ConfirmDialog
                message={pending?.message ?? null}
                onCancel={() => setPending(null)}
                onConfirm={() => {
                    if (pending) dispatch(pending.action);
                    setPending(null);
                }}
            />
        </VStack>
    );
};
