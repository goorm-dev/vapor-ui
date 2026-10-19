import { MultiSelect } from '@vapor-ui/core';

const fonts = [
    { label: 'Sans-serif', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

export default function DefaultMultiSelect() {
    return (
        <MultiSelect.Root items={fonts} placeholder="폰트를 선택하세요">
            <MultiSelect.Trigger />

            <MultiSelect.Popup>
                {fonts.map((font) => (
                    <MultiSelect.Item key={font.value} value={font.value}>
                        {font.label}
                    </MultiSelect.Item>
                ))}
            </MultiSelect.Popup>
        </MultiSelect.Root>
    );
}
