import { HStack, Text, TextInput, VStack } from '@vapor-ui/core';

export default function TextInputType() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    text
                </Text>
                <TextInput type="text" placeholder="Enter text" />
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    email
                </Text>
                <TextInput type="email" placeholder="Enter email" />
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    password
                </Text>
                <TextInput type="password" placeholder="Enter password" />
            </HStack>
        </VStack>
    );
}
