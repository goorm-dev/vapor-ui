import { HStack, Radio, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioGroupSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'flex-start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <RadioGroup.Root name="size-md" size="md">
                    <VStack $css={{ gap: '$100' }}>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="md1" />
                                Medium Option 1
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="md2" />
                                Medium Option 2
                            </HStack>
                        </Text>
                    </VStack>
                </RadioGroup.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'flex-start' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <RadioGroup.Root name="size-lg" size="lg">
                    <VStack $css={{ gap: '$100' }}>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="lg1" />
                                Large Option 1
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="lg2" />
                                Large Option 2
                            </HStack>
                        </Text>
                    </VStack>
                </RadioGroup.Root>
            </HStack>
        </VStack>
    );
}
