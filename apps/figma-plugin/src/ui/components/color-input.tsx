import { useRef, useState } from 'react';

import { Box, Field, TextInput } from '@vapor-ui/core';

import { isHex } from '~/ui/features/theme-draft';

interface ColorInputProps extends Omit<TextInput.Props, 'onChange' | 'value'> {
    label: string;
    /** A valid `#rrggbb`. */
    value: string;
    /** Called only with a valid lowercase `#rrggbb`. */
    onChange: (value: string) => void;
}

/**
 * HEX text field with a color picker. Partial input stays local until it forms a valid HEX, and
 * blur shows the committed value again.
 */
export const ColorInput = ({
    label,
    value,
    onChange,
    placeholder = '#000000',
    ...props
}: ColorInputProps) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [typing, setTyping] = useState<string | null>(null);

    const handleText = (text: string) => {
        const hex = (text.startsWith('#') ? text : `#${text}`).toLowerCase();
        if (isHex(hex)) {
            setTyping(null);
            onChange(hex);
        } else setTyping(text);
    };

    return (
        <Field.Root className="w-full">
            <Field.Label className="flex justify-between items-center">
                {label}
                <Box className="relative">
                    <TextInput
                        value={typing ?? value}
                        onChange={(e) => handleText(e.target.value)}
                        onBlur={() => setTyping(null)}
                        placeholder={placeholder}
                        className="pl-10 w-[200px]"
                        onClick={() => colorInputRef.current?.click()}
                        {...props}
                    />
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value.toLowerCase())}
                        className="absolute top-1/2 left-2 -translate-y-1/2 w-6 h-6 p-0 border-0 bg-transparent cursor-pointer"
                    />
                </Box>
            </Field.Label>
        </Field.Root>
    );
};
