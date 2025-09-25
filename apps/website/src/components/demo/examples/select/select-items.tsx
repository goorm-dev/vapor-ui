import { Select, VStack } from '@vapor-ui/core';

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

export default function SelectItems() {
    return (
        <VStack gap="$300" width="400px">
            <VStack>
                <h4 className="text-sm font-medium mb-2">배열 형태의 아이템</h4>
                <Select.Root placeholder="폰트 선택" items={fonts}>
                    <Select.Trigger>
                        <Select.Value />
                        <Select.TriggerIcon />
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            <Select.GroupLabel>폰트</Select.GroupLabel>
                            {fonts.map((font) => (
                                <Select.Item key={font.value} value={font.value}>
                                    {font.label}
                                    <Select.ItemIndicator />
                                </Select.Item>
                            ))}
                        </Select.Group>
                    </Select.Content>
                </Select.Root>
            </VStack>

            <VStack>
                <h4 className="text-sm font-medium mb-2">객체 형태의 아이템</h4>
                <Select.Root placeholder="언어 선택" items={languages}>
                    <Select.Trigger>
                        <Select.Value />
                        <Select.TriggerIcon />
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            <Select.GroupLabel>프로그래밍 언어</Select.GroupLabel>
                            {Object.entries(languages).map(([value, label]) => (
                                <Select.Item key={value} value={value}>
                                    {label}
                                    <Select.ItemIndicator />
                                </Select.Item>
                            ))}
                        </Select.Group>
                    </Select.Content>
                </Select.Root>
            </VStack>
        </VStack>
    );
}
