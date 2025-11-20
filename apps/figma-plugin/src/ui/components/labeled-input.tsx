import { Field, TextInput } from '@vapor-ui/core';

interface LabeledInputProps extends Omit<TextInput.Props, 'onChange' | 'type' | 'value'> {
    label: string;
    onChange: (value: string) => void;
    value: string | number;
    type?: 'text' | 'number';
}

export const LabeledInput = ({ label, value, onChange, type, ...props }: LabeledInputProps) => {
    return (
        <Field.Root className="w-full">
            <Field.Label className="flex justify-between items-center">
                {label}

                <TextInput
                    value={String(value)}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-[200px]"
                    type={type as TextInput.Props['type']}
                    {...props}
                />
            </Field.Label>
        </Field.Root>
    );
};
