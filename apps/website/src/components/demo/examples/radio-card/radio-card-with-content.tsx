import { useState } from 'react';

import { HStack, RadioCard, RadioGroup, Text, VStack } from '@vapor-ui/core';

export default function RadioCardWithContent() {
    const [value, setValue] = useState('basic');

    return (
        <div className="space-y-4">
            <Text typography="body2">선택된 플랜: {value}</Text>
            <RadioGroup.Root
                name="pricing-plan"
                value={value}
                onValueChange={(newValue) => setValue(newValue as string)}
            >
                <HStack $styles={{ gap: '$150' }}>
                    <RadioCard value="basic">
                        <VStack $styles={{ gap: '$50' }}>
                            <Text typography="subtitle1">Basic</Text>
                            <Text typography="body2" foreground="hint-100">
                                $9/month
                            </Text>
                            <Text typography="body3" foreground="hint-200">
                                5 projects included
                            </Text>
                        </VStack>
                    </RadioCard>
                    <RadioCard value="pro">
                        <VStack $styles={{ gap: '$50' }}>
                            <Text typography="subtitle1">Pro</Text>
                            <Text typography="body2" foreground="hint-100">
                                $29/month
                            </Text>
                            <Text typography="body3" foreground="hint-200">
                                Unlimited projects
                            </Text>
                        </VStack>
                    </RadioCard>
                    <RadioCard value="enterprise">
                        <VStack $styles={{ gap: '$50' }}>
                            <Text typography="subtitle1">Enterprise</Text>
                            <Text typography="body2" foreground="hint-100">
                                Custom pricing
                            </Text>
                            <Text typography="body3" foreground="hint-200">
                                Advanced features
                            </Text>
                        </VStack>
                    </RadioCard>
                </HStack>
            </RadioGroup.Root>
        </div>
    );
}
