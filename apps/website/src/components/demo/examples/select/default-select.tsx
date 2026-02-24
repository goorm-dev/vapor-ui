import { Select } from '@vapor-ui/core';

const fonts = [
    { label: 'Sans-serif', value: 'sans-serif' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

export default function DefaultSelect() {
    return (
        <Select.Root placeholder="폰트를 선택하세요" items={fonts}>
            <Select.Trigger $css={{ width: '400px' }} />

            <Select.Popup>
                <Select.Group>
                    <Select.GroupLabel>폰트</Select.GroupLabel>
                    {fonts.map((font) => (
                        <Select.Item key={font.value} value={font.value}>
                            {font.label}
                        </Select.Item>
                    ))}
                </Select.Group>
            </Select.Popup>
        </Select.Root>
    );
}
