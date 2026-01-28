import { HStack, Radio, Text } from '@vapor-ui/core';

export default function DefaultRadio() {
    return (
        <Text render={<label />} typography="body2">
            <HStack gap="$100" alignItems="center">
                <Radio.Root value="option1" />
                Option 1
            </HStack>
        </Text>
    );
}
