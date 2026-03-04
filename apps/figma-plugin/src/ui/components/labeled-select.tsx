import { type SelectHTMLAttributes } from 'react';

export interface SelectOption<T = string> {
    value: T;
    label: string;
}

interface LabeledSelectProps<T = string> extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'onChange' | 'value'
> {
    label: string;
    value: T;
    onChange: (value: T) => void;
    options: SelectOption<T>[];
}

export const LabeledSelect = <T extends string>({
    label,
    value,
    onChange,
    options,
    className = '',
    ...selectProps
}: LabeledSelectProps<T>) => {
    const selectId = `labeled-select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="flex items-center gap-2">
            <label htmlFor={selectId} className="text-xs text-gray-600 min-w-[102px]">
                {label}:
            </label>
            <select
                id={selectId}
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className={`px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
                {...selectProps}
            >
                {options.map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
