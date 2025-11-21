import { useRef } from 'react';

import { Box, Field, TextInput } from '@vapor-ui/core';

interface ColorInputProps extends Omit<TextInput.Props, 'onChange'> {
    label: string;
    onChange: (value: string) => void;
}

export const ColorInput = ({
    label,
    value,
    onChange,
    placeholder = '#000000',
    ...props
}: ColorInputProps) => {
    const colorInputRef = useRef<HTMLInputElement>(null);

    const handleTextInputClick = () => {
        colorInputRef.current?.click();
    };

    return (
        <Field.Root className="w-full">
            <Field.Label className="flex justify-between items-center">
                {label}
                <Box className="relative">
                    <TextInput
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="pl-10 w-[200px]"
                        onClick={handleTextInputClick}
                        {...props}
                    />
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute top-1/2 left-2 -translate-y-1/2 w-6 h-6 p-0 border-0 bg-transparent cursor-pointer"
                    />
                </Box>
            </Field.Label>
        </Field.Root>
    );
};
