import { SegmentedControl, VStack } from '@vapor-ui/core';

export default function DefaultSegmentedControl() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <SegmentedControl.Root size="sm">
                <SegmentedControl.Item value="all">SM</SegmentedControl.Item>
                <SegmentedControl.Item value="in-progress">Test</SegmentedControl.Item>
            </SegmentedControl.Root>
            <SegmentedControl.Root size="md">
                <SegmentedControl.Item value="all">MD</SegmentedControl.Item>
                <SegmentedControl.Item value="in-progress">Test</SegmentedControl.Item>
            </SegmentedControl.Root>
            <SegmentedControl.Root size="lg">
                <SegmentedControl.Item value="all">LG</SegmentedControl.Item>
                <SegmentedControl.Item value="in-progress">Test</SegmentedControl.Item>
            </SegmentedControl.Root>
        </VStack>
    );
}
