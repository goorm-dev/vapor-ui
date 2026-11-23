import { useState } from 'react';

import type { ThemeResult } from '@vapor-ui/color-generator';
import { Button, HStack, Text, VStack } from '@vapor-ui/core';

import { ColorInput } from '~/ui/components/color-input';
import { LabeledInput } from '~/ui/components/labeled-input';
import { PaletteEditor } from '~/ui/components/palette-editor';
import { Section } from '~/ui/components/section';

import type { ThemeAction, ThemeDraft } from './theme-draft';
import { isValidName } from './theme-draft';

interface BasicTabProps {
    draft: ThemeDraft;
    theme: ThemeResult | null;
    baseline: ThemeResult | null;
    flags: Map<string, 'warn' | 'fail'>;
    request: (action: ThemeAction) => void;
}

export const BasicTab = ({ draft, theme, baseline, flags, request }: BasicTabProps) => {
    const [newName, setNewName] = useState('');
    const [newHex, setNewHex] = useState('#888888');
    const nameError = newName && !isValidName(newName);

    return (
        <VStack $css={{ gap: '$300' }}>
            {draft.basics.map((palette) => (
                <Section key={palette.name}>
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <ColorInput
                            label={palette.name}
                            value={palette.hex}
                            onChange={(hex) =>
                                request({ type: 'set-hex', name: palette.name, hex })
                            }
                        />
                        {!palette.preset && (
                            <Button
                                size="sm"
                                variant="ghost"
                                colorPalette="danger"
                                onClick={() =>
                                    request({ type: 'remove-basic', name: palette.name })
                                }
                            >
                                삭제
                            </Button>
                        )}
                    </HStack>
                    {draft.brand?.name === palette.name ? (
                        <Text typography="body3" foreground="hint-200">
                            브랜드 탭의 {palette.name}이(가) 이 팔레트를 대체해요.
                        </Text>
                    ) : (
                        theme &&
                        baseline && (
                            <PaletteEditor
                                name={palette.name}
                                theme={theme}
                                baseline={baseline}
                                hues={palette.hues}
                                flags={flags}
                                onHue={(scale, hue) =>
                                    request({ type: 'set-hue', name: palette.name, scale, hue })
                                }
                            />
                        )
                    )}
                </Section>
            ))}

            <Section>
                <Section.Title title="새 색 추가" />
                <LabeledInput
                    label="Color Name"
                    value={newName}
                    onChange={(value) => setNewName(value.trim())}
                    placeholder="teal"
                    invalid={Boolean(nameError)}
                />
                {nameError && (
                    <Text typography="body4" foreground="danger-100">
                        소문자로 시작하고 소문자, 숫자, -만 써요. gray는 쓸 수 없어요.
                    </Text>
                )}
                <ColorInput label="Hex Code" value={newHex} onChange={setNewHex} />
                <Button
                    disabled={!isValidName(newName)}
                    onClick={() => {
                        request({ type: 'add-basic', name: newName, hex: newHex });
                        setNewName('');
                    }}
                >
                    새 색 추가
                </Button>
            </Section>

            {theme && baseline && (
                <Section>
                    <Section.Title title="gray" />
                    <PaletteEditor
                        name="gray"
                        theme={theme}
                        baseline={baseline}
                        hues={{}}
                        flags={flags}
                    />
                </Section>
            )}
        </VStack>
    );
};
