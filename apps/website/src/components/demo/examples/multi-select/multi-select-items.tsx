import { MultiSelect } from '@vapor-ui/core';

const fonts = [
    { label: 'Sans-serif', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

const languages = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    go: 'Go',
};

export default function MultiSelectItems() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">배열 형태의 아이템</h4>
                <MultiSelect.Root placeholder="폰트 선택" items={fonts}>
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
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">객체 형태의 아이템</h4>
                <MultiSelect.Root placeholder="언어 선택" items={languages}>
                    <MultiSelect.Trigger>
                        <MultiSelect.Value />
                        <MultiSelect.TriggerIcon />
                    </MultiSelect.Trigger>
                    <MultiSelect.Content>
                        {Object.entries(languages).map(([value, label]) => (
                            <MultiSelect.Item key={value} value={value}>
                                {label}
                                <MultiSelect.ItemIndicator />
                            </MultiSelect.Item>
                        ))}
                    </MultiSelect.Content>
                </MultiSelect.Root>
            </div>
        </div>
    );
}
