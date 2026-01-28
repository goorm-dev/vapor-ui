import { Button, HStack, Text, VStack } from '@vapor-ui/core';

export default function ButtonDisabled() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    enabled
                </Text>
                <Button>Save</Button>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <Button disabled>Save</Button>
            </HStack>
        </VStack>
    );
}
