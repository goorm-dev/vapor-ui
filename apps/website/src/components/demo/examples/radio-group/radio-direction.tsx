import { HStack, Radio, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioDirection() {
    return (
        <VStack $css={{ gap: '$300' }}>
            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    vertical
                </Text>
                <RadioGroup.Root name="direction-vertical" defaultValue="v1">
                    <VStack $css={{ gap: '$100' }}>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="v1" />
                                Option 1
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="v2" />
                                Option 2
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="v3" />
                                Option 3
                            </HStack>
                        </Text>
                    </VStack>
                </RadioGroup.Root>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    horizontal
                </Text>
                <RadioGroup.Root name="direction-horizontal" defaultValue="h1">
                    <HStack $css={{ gap: '$200' }}>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="h1" />
                                Option 1
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="h2" />
                                Option 2
                            </HStack>
                        </Text>
                        <Text render={<label />} typography="body2">
                            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                                <Radio.Root value="h3" />
                                Option 3
                            </HStack>
                        </Text>
                    </HStack>
                </RadioGroup.Root>
            </VStack>
        </VStack>
    );
}
