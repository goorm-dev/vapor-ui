import { ProgressBar, VStack } from '@vapor-ui/core';

export default function ProgressBarSize() {
    return (
        <VStack $css={{ gap: '$300', width: '20rem' }}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <ProgressBar.Root key={size} value={42} size={size}>
                    <ProgressBar.Label>{size}</ProgressBar.Label>
                    <ProgressBar.Value />
                    <ProgressBar.Track>
                        <ProgressBar.Indicator />
                    </ProgressBar.Track>
                </ProgressBar.Root>
            ))}
        </VStack>
    );
}
