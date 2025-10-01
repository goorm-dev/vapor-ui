interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const ColorInput = ({
    label,
    value,
    onChange,
    placeholder = '#000000',
}: ColorInputProps) => {
    return (
        <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 min-w-[102px] capitalize">{label}:</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={placeholder}
            />
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                title={`Pick ${label} color`}
            />
        </div>
    );
};
