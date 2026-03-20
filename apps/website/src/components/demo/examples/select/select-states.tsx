import { HStack, Select, Text, VStack } from '@vapor-ui/core';

export default function SelectStates() {
    return (
        <VStack $css={{ gap: '$150', width: '400px' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    default
                </Text>
                <SelectTemplate placeholder="기본 상태" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <SelectTemplate placeholder="비활성화" disabled />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    readOnly
                </Text>
                <SelectTemplate placeholder="읽기 전용" readOnly />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    invalid
                </Text>
                <SelectTemplate placeholder="오류 상태" invalid />
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
