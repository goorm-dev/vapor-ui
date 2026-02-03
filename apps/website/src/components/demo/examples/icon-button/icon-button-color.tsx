import { HStack, IconButton, Text, VStack } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonColor() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    primary
                </Text>
                <IconButton colorPalette="primary" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    secondary
                </Text>
                <IconButton colorPalette="secondary" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    success
                </Text>
                <IconButton colorPalette="success" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    warning
                </Text>
                <IconButton colorPalette="warning" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    danger
                </Text>
                <IconButton colorPalette="danger" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    contrast
                </Text>
                <IconButton colorPalette="contrast" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
        </VStack>
    );
}
