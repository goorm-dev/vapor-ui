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
        <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
                <label htmlFor={sliderId} className="text-xs text-gray-600">
                    {label}:
                </label>
                <span className="text-xs text-gray-600">{value}</span>
            </div>
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
        </div>
    );
};
