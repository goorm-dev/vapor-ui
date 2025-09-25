import { MultiSelect } from '@vapor-ui/core';

const fonts = [
    { label: 'Sans-serif', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

export default function DefaultMultiSelect() {
    return (
        <MultiSelect.Root placeholder="폰트를 선택하세요" items={fonts}>
            <MultiSelect.Trigger>
                <MultiSelect.Value />
                <MultiSelect.TriggerIcon />
            </MultiSelect.Trigger>

            <MultiSelect.Content>
                {fonts.map((font) => (
                    <MultiSelect.Item key={font.value} value={font.value}>
                        {font.label}
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                ))}
            </MultiSelect.Content>
        </MultiSelect.Root>
    );
}
