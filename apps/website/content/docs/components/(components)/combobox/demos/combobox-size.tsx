import { Combobox, HStack, Text, VStack } from '@vapor-ui/core';

const sizes = ['sm', 'md', 'lg', 'xl'] as const;

export default function ComboboxSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            {sizes.map((size) => (
                <HStack key={size} $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-8" typography="body3" foreground="hint-100">
                        {size}
                    </Text>
                    <ComboboxTemplate size={size} placeholder={size} aria-label={size} />
                </HStack>
            ))}
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
