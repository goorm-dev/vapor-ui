import { Button, HStack, Text, VStack } from '@vapor-ui/core';

export default function ButtonVariant() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    fill
                </Text>
                <Button variant="fill">Save</Button>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    outline
                </Text>
                <Button variant="outline">Save</Button>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    ghost
                </Text>
                <Button variant="ghost">Save</Button>
            </HStack>
        </VStack>
    );
}
