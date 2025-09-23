import { Select } from '@vapor-ui/core';

const fonts = {
    sans: 'Sans-serif',
    serif: 'Serif',
    mono: 'Monospace',
    cursive: 'Cursive',
};

export default function SelectCustomValue() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 값 표시</h4>
                <Select.Root placeholder="폰트 선택" items={fonts}>
                    <Select.Trigger>
                        <Select.Value />
                        <Select.TriggerIcon />
                    </Select.Trigger>
                    <Select.Content>
                        {Object.entries(fonts).map(([value, label]) => (
                            <Select.Item key={value} value={value}>
                                {label}
                                <Select.ItemIndicator />
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">커스텀 값 표시</h4>
                <Select.Root placeholder="폰트 선택" items={fonts}>
                    <Select.Trigger>
                        <Select.Value>
                            {(value: string) => (
                                <span style={{ fontFamily: value }}>
                                    {fonts[value as keyof typeof fonts]}
                                </span>
                            )}
                        </Select.Value>
                        <Select.TriggerIcon />
                    </Select.Trigger>
                    <Select.Content>
                        {Object.entries(fonts).map(([value, label]) => (
                            <Select.Item key={value} value={value}>
                                <span style={{ fontFamily: value }}>{label}</span>
                                <Select.ItemIndicator />
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>
        </div>
    );
}
