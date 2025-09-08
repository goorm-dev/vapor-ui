import { type InputHTMLAttributes } from 'react';

interface LabeledInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    labelWidth?: string;
}

export const LabeledInput = ({ 
    label, 
    value, 
    onChange, 
    labelWidth = 'min-w-[80px]',
    className = '',
    ...inputProps 
}: LabeledInputProps) => {
    const inputId = `labeled-input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
        <div className="flex items-center gap-2">
            <label 
                htmlFor={inputId}
                className={`text-xs text-gray-600 ${labelWidth}`}
            >
                {label}:
            </label>
            <input
                id={inputId}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
                {...inputProps}
            />
        </div>
    );
};