import { Button, HStack, Text, VStack } from '@vapor-ui/core';

export default function ButtonSize() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Button size="sm">Save</Button>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Button size="md">Save</Button>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Button size="lg">Save</Button>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Button size="xl">Save</Button>
            </HStack>
        </VStack>
    );
}
