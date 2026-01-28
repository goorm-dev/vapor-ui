import { Button, HStack, Text, VStack } from '@vapor-ui/core';

export default function ButtonColor() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    primary
                </Text>
                <Button colorPalette="primary">Save</Button>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    secondary
                </Text>
                <Button colorPalette="secondary">Save</Button>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    success
                </Text>
                <Button colorPalette="success">Save</Button>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    warning
                </Text>
                <Button colorPalette="warning">Save</Button>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    danger
                </Text>
                <Button colorPalette="danger">Save</Button>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    contrast
                </Text>
                <Button colorPalette="contrast">Save</Button>
            </HStack>
        </VStack>
    );
}
