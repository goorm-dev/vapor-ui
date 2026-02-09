import { HStack, MultiSelect, Text, VStack } from '@vapor-ui/core';

const options = [
    { label: '옵션 1', value: 'option1' },
    { label: '옵션 2', value: 'option2' },
    { label: '옵션 3', value: 'option3' },
];

export default function MultiSelectSize() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <MultiSelectTemplate placeholder="Small" size="sm" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    md
                </Text>
                <MultiSelectTemplate placeholder="Medium" size="md" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <MultiSelectTemplate placeholder="Large" size="lg" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <MultiSelectTemplate placeholder="Extra Large" size="xl" />
            </HStack>
        </VStack>
    );
}

const MultiSelectTemplate = (props: MultiSelect.Root.Props<string>) => {
    return (
        <MultiSelect.Root {...props} items={options}>
            <MultiSelect.Trigger />
            <MultiSelect.Popup>
                {options.map((option) => (
                    <MultiSelect.Item key={option.value} value={option.value}>
                        {option.label}
                    </MultiSelect.Item>
                ))}
            </MultiSelect.Popup>
        </MultiSelect.Root>
    );
};
