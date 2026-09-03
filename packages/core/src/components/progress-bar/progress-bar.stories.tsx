import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressBar } from '.';
import { VStack } from '../v-stack';

export default {
    title: 'ProgressBar',
    component: ProgressBar.Root,
} satisfies Meta<typeof ProgressBar.Root>;

const Bar = (props: ProgressBar.Root.Props & { label: string; description?: string }) => {
    const { label, description, ...rootProps } = props;

    return (
        <ProgressBar.Root {...rootProps}>
            <ProgressBar.Label>{label}</ProgressBar.Label>
            <ProgressBar.Value />
            <ProgressBar.Track />
            {description ? <ProgressBar.Description>{description}</ProgressBar.Description> : null}
        </ProgressBar.Root>
    );
};

export const Default: StoryObj<typeof ProgressBar.Root> = {
    args: { value: 42 },
    render: (args) => (
        <div style={{ width: 320 }}>
            <Bar {...args} label="report.pdf 업로드" />
        </div>
    ),
};

export const TestBed: StoryObj<typeof ProgressBar.Root> = {
    render: () => (
        <VStack gap="$300" style={{ width: 320 }}>
            <Bar label="determinate" value={42} />
            <Bar label="empty (value=0)" value={0} />
            <Bar label="complete" value={100} />
            <Bar label="indeterminate" value={null} />
            <Bar label="clamped (value=150)" value={150} />
            <Bar label="described" value={42} description="10MB 중 4.2MB 전송했습니다" />

            {/* 시안 6조합: size × type. error 는 트랙만 감광되고 인디케이터가 빠진다. */}
            <Bar label="sm / default" size="sm" value={42} />
            <Bar label="md / default" size="md" value={42} />
            <Bar label="lg / default" size="lg" value={42} />
            <Bar label="sm / error" size="sm" value={42} type="error" />
            <Bar label="md / error" size="md" value={42} type="error" />
            <Bar
                label="lg / error"
                size="lg"
                value={42}
                type="error"
                description="업로드에 실패했습니다. 파일이 10MB를 넘습니다"
            />

            {/* 라벨 영역 없음: 이름은 aria-label 로만 준다 */}
            <ProgressBar.Root aria-label="라벨 없는 진행률" value={42}>
                <ProgressBar.Track />
            </ProgressBar.Root>

            {/* 좁은 폭에서 긴 라벨·긴 값이 접히는 모습 (text-resize-200 / reflow-320) */}
            <div style={{ width: 160 }}>
                <Bar
                    label="아주 긴 파일 이름을 가진 첨부 파일 업로드 진행 상황"
                    value={42}
                    format={{ style: 'unit', unit: 'megabyte', unitDisplay: 'long' }}
                    description="네트워크 상태에 따라 남은 시간이 달라질 수 있습니다"
                />
            </div>
        </VStack>
    ),
};
