import { Checkbox, HStack, Text, VStack } from '@vapor-ui/core';

export default function CheckboxInvalid() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-32" typography="body3" foreground="hint-100">
                    invalid
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Checkbox.Root invalid />
                        Accept terms
                    </HStack>
                </Text>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-32" typography="body3" foreground="hint-100">
                    invalid checked
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Checkbox.Root invalid checked />
                        Accept terms
                    </HStack>
                </Text>
            </HStack>
        </VStack>
    );
}
