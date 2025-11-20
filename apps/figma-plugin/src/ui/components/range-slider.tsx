import { Badge, Field } from '@vapor-ui/core';

interface RangeSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
}

export const RangeSlider = ({ label, value, onChange, min, max, step = 1 }: RangeSliderProps) => {
    const sliderId = `range-slider-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <Field.Root className="flex flex-row justify-between items-center">
            <Field.Label htmlFor={sliderId}>{label}</Field.Label>
            <div className="flex items-center gap-v-100 w-[200px]">
                <input
                    id={sliderId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <Badge size="md" shape="square" className="w-[40px]">
                    {value}
                </Badge>
            </div>
        </Field.Root>
    );
};
