import { HStack, Spinner, VStack } from '@vapor-ui/core';

export default function SpinnerSize() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'end' }}>
            <VStack $css={{ alignItems: 'center', gap: '$100' }}>
                <Spinner size="md" />
                md
            </VStack>

            <VStack $css={{ alignItems: 'center', gap: '$100' }}>
                <Spinner size="lg" />
                lg
            </VStack>

            <VStack $css={{ alignItems: 'center', gap: '$100' }}>
                <Spinner size="xl" />
                xl
            </VStack>
        </HStack>
    );
}
