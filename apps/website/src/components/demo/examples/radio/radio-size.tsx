import { HStack, Radio, Text, VStack } from '@vapor-ui/core';

export default function RadioSize() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Radio.Root size="md" value="md-1" />
                        Medium Size
                    </HStack>
                </Text>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Radio.Root size="lg" value="lg-1" />
                        Large Size
                    </HStack>
                </Text>
            </HStack>
        </VStack>
    );
}
