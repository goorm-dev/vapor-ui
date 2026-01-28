import { Callout, Text, VStack } from '@vapor-ui/core';

export default function CalloutColor() {
    return (
        <VStack gap="$150" className="w-full max-w-xl">
            <VStack gap="$050">
                <Text typography="body3" foreground="hint-100">
                    primary
                </Text>
                <Callout.Root colorPalette="primary">
                    Your changes have been saved successfully.
                </Callout.Root>
            </VStack>
            <VStack gap="$050">
                <Text typography="body3" foreground="hint-100">
                    success
                </Text>
                <Callout.Root colorPalette="success">
                    Your changes have been saved successfully.
                </Callout.Root>
            </VStack>
            <VStack gap="$050">
                <Text typography="body3" foreground="hint-100">
                    warning
                </Text>
                <Callout.Root colorPalette="warning">
                    Your changes have been saved successfully.
                </Callout.Root>
            </VStack>
            <VStack gap="$050">
                <Text typography="body3" foreground="hint-100">
                    danger
                </Text>
                <Callout.Root colorPalette="danger">
                    Your changes have been saved successfully.
                </Callout.Root>
            </VStack>
            <VStack gap="$050">
                <Text typography="body3" foreground="hint-100">
                    hint
                </Text>
                <Callout.Root colorPalette="hint">
                    Your changes have been saved successfully.
                </Callout.Root>
            </VStack>
            <VStack gap="$050">
                <Text typography="body3" foreground="hint-100">
                    contrast
                </Text>
                <Callout.Root colorPalette="contrast">
                    Your changes have been saved successfully.
                </Callout.Root>
            </VStack>
        </VStack>
    );
}
