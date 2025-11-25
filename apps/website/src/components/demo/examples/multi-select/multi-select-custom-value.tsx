import { Badge, Flex, Grid, MultiSelect, Text, VStack } from '@vapor-ui/core';

const languages = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    go: 'Go',
    rust: 'Rust',
};

const renderRestValue = (value: string[]) => {
    if (!value.length) {
        return <MultiSelect.PlaceholderPrimitive>언어 선택</MultiSelect.PlaceholderPrimitive>;
    }

    const displayValues = value.slice(0, 2);
    const remainingCount = value.length - 2;

    return (
        <Flex gap="$050" className="flex-wrap">
            {displayValues.map((val) => (
                <Badge key={val} size="sm">
                    {languages[val as keyof typeof languages]}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <Badge size="sm" colorPalette="hint">
                    +{remainingCount} more
                </Badge>
            )}
        </Flex>
    );
};

const renderStringValue = (value: string[]) => {
    if (!value.length) {
        return <MultiSelect.PlaceholderPrimitive>언어 선택</MultiSelect.PlaceholderPrimitive>;
    }

    return value.map((v) => languages[v as keyof typeof languages]).join(', ');
};

export default function MultiSelectCustomValue() {
    return (
        <Grid.Root templateColumns="1fr 1fr" gap="$300">
            <VStack gap="$100" width="250px">
                <Text typography="body2">커스텀 값 표시 (최대 2개 + 더보기)</Text>
                <MultiSelect.Root items={languages} placeholder="언어 선택">
                    <MultiSelect.Trigger>
                        <MultiSelect.ValuePrimitive>{renderRestValue}</MultiSelect.ValuePrimitive>
                        <MultiSelect.TriggerIconPrimitive />
                    </MultiSelect.Trigger>
                    <MultiSelect.Popup>
                        {Object.entries(languages).map(([value, label]) => (
                            <MultiSelect.Item key={value} value={value}>
                                {label}
                            </MultiSelect.Item>
                        ))}
                    </MultiSelect.Popup>
                </MultiSelect.Root>
            </VStack>

            <VStack gap="$100" width="250px">
                <Text typography="body2">문자열 형태 표시</Text>
                <MultiSelect.Root items={languages} placeholder="언어 선택">
                    <MultiSelect.Trigger>
                        <MultiSelect.ValuePrimitive>{renderStringValue}</MultiSelect.ValuePrimitive>
                        <MultiSelect.TriggerIconPrimitive />
                    </MultiSelect.Trigger>
                    <MultiSelect.Popup>
                        {Object.entries(languages).map(([value, label]) => (
                            <MultiSelect.Item key={value} value={value}>
                                {label}
                            </MultiSelect.Item>
                        ))}
                    </MultiSelect.Popup>
                </MultiSelect.Root>
            </VStack>
        </Grid.Root>
    );
}
