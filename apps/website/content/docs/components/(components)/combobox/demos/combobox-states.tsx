import { Combobox, HStack, Text, VStack } from '@vapor-ui/core';

export default function ComboboxStates() {
    return (
        <VStack $css={{ gap: '$150', width: '400px' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    default
                </Text>
                <ComboboxTemplate placeholder="기본 상태" aria-label="기본 상태" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <ComboboxTemplate placeholder="비활성화" aria-label="비활성화" disabled />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    readOnly
                </Text>
                <ComboboxTemplate placeholder="읽기 전용" aria-label="읽기 전용" readOnly />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    invalid
                </Text>
                <ComboboxTemplate placeholder="오류 상태" aria-label="오류 상태" invalid />
            </HStack>
        </VStack>
    );
}

const ComboboxTemplate = (props: Combobox.Root.Props<string>) => {
    return (
        <Combobox.Root items={['옵션 1', '옵션 2']} {...props}>
            <Combobox.InputGroup />
            <Combobox.Popup>
                {(item: string) => (
                    <Combobox.Item key={item} value={item}>
                        {item}
                    </Combobox.Item>
                )}
            </Combobox.Popup>
        </Combobox.Root>
    );
};
