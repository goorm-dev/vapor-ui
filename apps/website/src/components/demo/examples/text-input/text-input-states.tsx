import { HStack, Text, TextInput, VStack } from '@vapor-ui/core';

export default function TextInputStates() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    default
                </Text>
                <TextInput placeholder="Enter text" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <TextInput disabled placeholder="Disabled" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    invalid
                </Text>
                <TextInput invalid placeholder="Invalid" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    readOnly
                </Text>
                <TextInput readOnly value="Read only value" />
            </HStack>
        </VStack>
    );
}
