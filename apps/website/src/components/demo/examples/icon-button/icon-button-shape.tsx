import { HStack, IconButton, Text, VStack } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonShape() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    square
                </Text>
                <IconButton shape="square" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    circle
                </Text>
                <IconButton shape="circle" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
        </VStack>
    );
}
