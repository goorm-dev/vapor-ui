import { SegmentedControl } from '@vapor-ui/core';

export default function DefaultSegmentedControl() {
    return (
        <SegmentedControl.Root>
            <SegmentedControl.Item value="all">전체</SegmentedControl.Item>
            <SegmentedControl.Item disabled value="in-progress">
                진행 중
            </SegmentedControl.Item>
            <SegmentedControl.Item value="completed">완료</SegmentedControl.Item>
            <SegmentedControl.Item value="upcoming">예정</SegmentedControl.Item>
        </SegmentedControl.Root>
    );
}
