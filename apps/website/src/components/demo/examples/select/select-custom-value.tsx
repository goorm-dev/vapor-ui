import { Box, Select } from '@vapor-ui/core';

const fonts = {
    sans: 'Sans-serif',
    serif: 'Serif',
    mono: 'Monospace',
    cursive: 'Cursive',
};

const renderValue = (value: string) => {
    if (!value) return '선택된 폰트 없음';
    return <span style={{ fontFamily: value }}>{fonts[value as keyof typeof fonts]}</span>;
};

export default function SelectCustomValue() {
    return (
        <Box width="400px">
            <Select.Root placeholder="폰트 선택" items={fonts}>
                <h4 className="text-sm font-medium mb-2">커스텀 값 표시</h4>
                <Select.Trigger>
                    <Select.Value>{renderValue}</Select.Value>
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
        </Box>
    );
}
