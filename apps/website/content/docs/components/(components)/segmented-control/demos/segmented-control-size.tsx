import { SegmentedControl, VStack } from '@vapor-ui/core';

export default function SegmentedControlSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <SegmentedControl.Root size="sm" aria-label="작은 크기 예시">
                <SegmentedControl.Item value="all">SM</SegmentedControl.Item>
                <SegmentedControl.Item value="in-progress">Test</SegmentedControl.Item>
            </SegmentedControl.Root>
            <SegmentedControl.Root size="md" aria-label="중간 크기 예시">
                <SegmentedControl.Item value="all">MD</SegmentedControl.Item>
                <SegmentedControl.Item value="in-progress">Test</SegmentedControl.Item>
            </SegmentedControl.Root>
            <SegmentedControl.Root size="lg" aria-label="큰 크기 예시">
                <SegmentedControl.Item value="all">LG</SegmentedControl.Item>
                <SegmentedControl.Item value="in-progress">Test</SegmentedControl.Item>
            </SegmentedControl.Root>
        </VStack>
    );
}
