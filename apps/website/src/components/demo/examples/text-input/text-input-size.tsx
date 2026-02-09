import { HStack, Text, TextInput, VStack } from '@vapor-ui/core';

export default function TextInputSize() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <TextInput size="sm" placeholder="Small" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <TextInput size="md" placeholder="Medium" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <TextInput size="lg" placeholder="Large" />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <TextInput size="xl" placeholder="Extra Large" />
            </HStack>
        </VStack>
    );
}
