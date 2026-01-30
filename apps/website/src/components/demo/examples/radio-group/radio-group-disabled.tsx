import { HStack, Radio, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioGroupDisabled() {
    return (
        <VStack gap="$300">
            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    individual item disabled
                </Text>
                <RadioGroup.Root name="disabled-items" defaultValue="option1">
                    <VStack gap="$100">
                        <Text render={<label />} typography="body2">
                            <HStack gap="$100" alignItems="center">
                                <Radio.Root value="option1" />
                                Option 1 (Default)
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack gap="$100" alignItems="center">
                                <Radio.Root value="option2" />
                                Option 2 (Default)
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack gap="$100" alignItems="center">
                                <Radio.Root value="option3" disabled />
                                Option 3 (Disabled)
                            </HStack>
                        </Text>
                    </VStack>
                </RadioGroup.Root>
            </VStack>

            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    group disabled
                </Text>
                <RadioGroup.Root name="disabled-group" disabled defaultValue="group1">
                    <VStack gap="$100">
                        <Text render={<label />} typography="body2">
                            <HStack gap="$100" alignItems="center">
                                <Radio.Root value="group1" />
                                Group 1
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack gap="$100" alignItems="center">
                                <Radio.Root value="group2" />
                                Group 2
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack gap="$100" alignItems="center">
                                <Radio.Root value="group3" />
                                Group 3
                            </HStack>
                        </Text>
                    </VStack>
                </RadioGroup.Root>
            </VStack>
        </VStack>
    );
}
