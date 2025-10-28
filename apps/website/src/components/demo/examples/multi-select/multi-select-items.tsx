import { HStack, MultiSelect, Text, VStack } from '@vapor-ui/core';

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
        <HStack gap="$500">
            <VStack gap="$100" width="300px">
                <MultiSelect.Root placeholder="폰트 선택" items={fonts}>
                    <Text typography="body2">배열 형태의 아이템</Text>
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
            </VStack>

            <VStack gap="$100" width="300px">
                <MultiSelect.Root placeholder="언어 선택" items={languages}>
                    <Text typography="body2">객체 형태의 아이템</Text>
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
            </VStack>
        </HStack>
    );
}
