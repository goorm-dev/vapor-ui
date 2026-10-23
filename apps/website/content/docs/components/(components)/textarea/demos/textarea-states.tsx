import { HStack, Text, Textarea, VStack } from '@vapor-ui/core';

export default function TextareaStates() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    default
                </Text>
                <Textarea placeholder="Enter text" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <Textarea disabled placeholder="Disabled" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    invalid
                </Text>
                <Textarea invalid placeholder="Invalid" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    readOnly
                </Text>
                <Textarea readOnly defaultValue="Read only content" />
            </HStack>
        </VStack>
    );
}
