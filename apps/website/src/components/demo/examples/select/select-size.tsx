import { HStack, Select, Text, VStack } from '@vapor-ui/core';

export default function SelectSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <SelectTemplate placeholder="Small" size="sm" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    md
                </Text>
                <SelectTemplate placeholder="Medium" size="md" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <SelectTemplate placeholder="Large" size="lg" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <SelectTemplate placeholder="Extra Large" size="xl" />
            </HStack>
        </VStack>
    );
}

const SelectTemplate = (props: Select.Root.Props) => {
    return (
        <Select.Root {...props}>
            <Select.Trigger />
            <Select.Popup>
                <Select.Item value="option1">옵션 1</Select.Item>
                <Select.Item value="option2">옵션 2</Select.Item>
            </Select.Popup>
        </Select.Root>
    );
};
