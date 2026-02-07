import { HStack, MultiSelect, Text, VStack } from '@vapor-ui/core';

const options = [
    { label: '옵션 1', value: 'option1' },
    { label: '옵션 2', value: 'option2' },
    { label: '옵션 3', value: 'option3' },
];

export default function MultiSelectStates() {
    return (
        <VStack gap="$150" width="400px">
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    default
                </Text>
                <MultiSelectTemplate placeholder="기본 상태" />
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <MultiSelectTemplate placeholder="비활성화" disabled />
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    readOnly
                </Text>
                <MultiSelectTemplate placeholder="읽기 전용" readOnly />
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    invalid
                </Text>
                <MultiSelectTemplate placeholder="오류 상태" invalid />
            </HStack>
        </VStack>
    );
}

export const MultiSelectTemplate = (props: MultiSelect.Root.Props<string>) => {
    return (
        <MultiSelect.Root {...props}>
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
