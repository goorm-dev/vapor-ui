import { HStack, Text, Textarea, VStack } from '@vapor-ui/core';

export default function TextareaSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Textarea size="sm" placeholder="Small" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Textarea size="md" placeholder="Medium" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Textarea size="lg" placeholder="Large" />
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Textarea size="xl" placeholder="Extra Large" />
            </HStack>
        </VStack>
    );
}
