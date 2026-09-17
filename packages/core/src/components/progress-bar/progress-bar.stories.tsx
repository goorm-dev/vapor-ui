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
            <Bar
                label="아주 긴 파일명이라 줄바꿈이 일어날 수 있는 레이블 텍스트입니다. 업로드중입니다. pdf"
                value={40}
                description="업로드 중..."
            />
            <Bar label="sm / default" size="sm" value={42} />
            <Bar label="md / default" size="md" value={42} />
            <Bar label="lg / default" size="lg" value={42} />
            <Bar label="sm / indeterminate" size="sm" value={null} />
            <Bar label="md / indeterminate" size="md" value={null} />
            <Bar label="lg / indeterminate" size="lg" value={null} />
            <Bar label="sm / error" size="sm" value={42} type="error" />
            <Bar label="md / error" size="md" value={42} type="error" />
            <Bar
                label="lg / error"
                size="lg"
                value={42}
                type="error"
                description="업로드에 실패했습니다. 파일이 10MB를 넘습니다"
            />
        </VStack>
    ),
};
