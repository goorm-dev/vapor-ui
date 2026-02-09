import { HStack, Text, Textarea, VStack } from '@vapor-ui/core';

export default function TextareaSize() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Textarea size="sm" placeholder="Small" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Textarea size="md" placeholder="Medium" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Textarea size="lg" placeholder="Large" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Textarea size="xl" placeholder="Extra Large" />
            </HStack>
        </VStack>
    );
}
