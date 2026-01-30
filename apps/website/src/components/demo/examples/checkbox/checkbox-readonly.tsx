import { Checkbox, HStack, Text, VStack } from '@vapor-ui/core';

export default function CheckboxReadOnly() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-32" typography="body3" foreground="hint-100">
                    unchecked
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Checkbox.Root readOnly />
                        Remember me
                    </HStack>
                </Text>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-32" typography="body3" foreground="hint-100">
                    checked
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Checkbox.Root readOnly defaultChecked />
                        Remember me
                    </HStack>
                </Text>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-32" typography="body3" foreground="hint-100">
                    indeterminate
                </Text>
                <Text render={<label />} typography="body2">
                    <HStack gap="$100" alignItems="center">
                        <Checkbox.Root readOnly indeterminate />
                        Remember me
                    </HStack>
                </Text>
            </HStack>
        </VStack>
    );
}
