import { Checkbox, HStack, Text } from '@vapor-ui/core';

export default function DefaultCheckbox() {
    return (
        <Text render={<label />} typography="body2">
            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                <Checkbox.Root defaultChecked />I agree to the terms and conditions
            </HStack>
        </Text>
    );
}
