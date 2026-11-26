import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import { Box, Field, Text, TextInput } from '@vapor-ui/core';

import { LOW_CHROMA, chromaOf, commitHex } from '~/ui/features/theme-draft';

interface ColorInputProps extends Omit<TextInput.Props, 'onChange' | 'value'> {
    label: string;
    /** Rendered after the label, outside it so it stays out of the field's accessible name. */
    action?: ReactNode;
    /** A valid `#rrggbb`. */
    value: string;
    /** Called only with a lowercase `#rrggbb` that carries a hue. */
    onChange: (value: string) => void;
}

/**
 * HEX text field with a color picker. Typing stays local until blur or Enter; then a valid HEX
 * with a hue is committed and anything else snaps back to the committed value.
 */
export const ColorInput = ({
    label,
    action,
    value,
    onChange,
    placeholder = '#000000',
    ...props
}: ColorInputProps) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [typing, setTyping] = useState<string | null>(null);

    const commit = (text: string) => {
        const hex = commitHex(text);
        if (hex && hex !== value) onChange(hex);
        setTyping(null);
    };

    return (
        <Field.Root className="w-full">
            <Box className="flex items-center gap-v-100">
                <Field.Label className="min-w-0 break-all">{label}</Field.Label>
                {action}
                <Box className="relative shrink-0 ml-auto">
                    <TextInput
                        value={typing ?? value}
                        onChange={(e) => setTyping(e.target.value)}
                        onBlur={(e) => commit(e.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') commit(e.currentTarget.value);
                        }}
                        placeholder={placeholder}
                        className="pl-10 w-[200px]"
                        {...props}
                    />
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={value}
                        onChange={(e) => commit(e.target.value)}
                        aria-label={`${label} 색 선택`}
                        className="absolute top-1/2 left-2 -translate-y-1/2 w-6 h-6 p-0 border-0 bg-transparent cursor-pointer"
                    />
                </Box>
            </Box>
            {chromaOf(value) < LOW_CHROMA && (
                <Text typography="body3" foreground="hint-200" className="self-end">
                    채도가 낮아 색조가 불안정해요.
                </Text>
            )}
        </Field.Root>
    );
};
