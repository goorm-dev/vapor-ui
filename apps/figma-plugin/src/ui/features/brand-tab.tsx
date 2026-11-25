import { useState } from 'react';

import type { ThemeResult } from '@vapor-ui/color-generator';
import { Button, HStack, Text, VStack } from '@vapor-ui/core';

import { ColorInput } from '~/ui/components/color-input';
import { LabeledInput } from '~/ui/components/labeled-input';
import { PaletteEditor } from '~/ui/components/palette-editor';
import { Section } from '~/ui/components/section';

import type { ThemeAction, ThemeDraft } from './theme-draft';
import { isValidName } from './theme-draft';

interface BrandTabProps {
    draft: ThemeDraft;
    theme: ThemeResult | null;
    baseline: ThemeResult | null;
    /** Each palette's anchors with no hue edits: where its anchor sliders reset to. */
    anchorDefaults: ThemeResult['hueAnchors'];
    flags: Map<string, 'warn' | 'fail'>;
    request: (action: ThemeAction) => void;
}

export const BrandTab = ({
    draft,
    theme,
    baseline,
    anchorDefaults,
    flags,
    request,
}: BrandTabProps) => {
    const { brand } = draft;
    const [name, setName] = useState(brand?.name ?? '');
    const [hex, setHex] = useState(brand?.hex ?? '#2a72e5');
    const nameError = name && !isValidName(name);
    const unchanged = brand?.name === name && brand.hex === hex;

    return (
        <VStack $css={{ gap: '$300' }}>
            <Section>
                <Section.Title title="브랜드" />
                <Section.Description description="브랜드 HEX는 밝은 모드의 한 칸에 그대로 고정되고, 시맨틱 primary가 돼요.\n브랜드가 없으면 blue가 primary예요." />
                <LabeledInput
                    label="Color Name"
                    value={name}
                    onChange={(value) => setName(value.trim())}
                    placeholder="brand"
                    invalid={Boolean(nameError)}
                />
                {nameError && (
                    <Text typography="body3" foreground="danger-100">
                        소문자로 시작하고 소문자, 숫자, -만 써요. gray는 쓸 수 없어요.
                    </Text>
                )}
                <ColorInput label="Hex Code" value={hex} onChange={setHex} />
                <HStack $css={{ gap: '$150' }}>
                    <Button
                        variant="outline"
                        className="flex-1"
                        disabled={!isValidName(name) || unchanged}
                        onClick={() => request({ type: 'set-brand', name, hex })}
                    >
                        {brand ? '브랜드 변경' : '브랜드 적용'}
                    </Button>
                    {brand && (
                        <Button
                            variant="outline"
                            colorPalette="danger"
                            onClick={() => request({ type: 'clear-brand' })}
                        >
                            브랜드 제거
                        </Button>
                    )}
                </HStack>
            </Section>

            {brand && theme && baseline && (
                <Section>
                    <Section.Title title={brand.name} />
                    <Section.Description description="● 칸은 브랜드 HEX가 고정된 칸이라 색조를 바꿀 수 없어요." />
                    <PaletteEditor
                        name={brand.name}
                        theme={theme}
                        baseline={baseline}
                        hues={brand.hues}
                        flags={flags}
                        lockedScale={theme.brand?.scale}
                        onHue={(scale, hue) =>
                            request({ type: 'set-hue', name: brand.name, scale, hue })
                        }
                        advice={{ draft, request }}
                        anchors={{
                            edits: brand.anchors,
                            defaults: anchorDefaults?.[brand.name],
                            request,
                        }}
                    />
                </Section>
            )}
        </VStack>
    );
};
