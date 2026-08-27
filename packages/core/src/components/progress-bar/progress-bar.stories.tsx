import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressBar } from '.';
import { Button } from '../button';
import { VStack } from '../v-stack';

export default {
    title: 'ProgressBar',
    component: ProgressBar.Root,
} satisfies Meta<typeof ProgressBar.Root>;

const Bar = (props: ProgressBar.Root.Props & { label: string }) => {
    const { label, ...rootProps } = props;

    return (
        <ProgressBar.Root {...rootProps}>
            <ProgressBar.Label>{label}</ProgressBar.Label>
            <ProgressBar.Value />
            <ProgressBar.Track>
                <ProgressBar.Indicator />
            </ProgressBar.Track>
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

/** The value text is scaled by the declared range, not by 100. */
export const CustomRange: StoryObj<typeof ProgressBar.Root> = {
    render: () => (
        <VStack gap="$300" style={{ width: 320 }}>
            <Bar label="디스크 검사" value={15} min={10} max={20} />
            <Bar
                label="파일 업로드"
                value={3}
                max={8}
                getAriaValueText={(_, value) => `8개 중 ${value}개`}
            />
        </VStack>
    ),
};

export const Sizes: StoryObj<typeof ProgressBar.Root> = {
    render: () => (
        <VStack gap="$300" style={{ width: 320 }}>
            <Bar label="size = sm" value={42} size="sm" />
            <Bar label="size = md" value={42} size="md" />
            <Bar label="size = lg" value={42} size="lg" />
        </VStack>
    ),
};

export const Types: StoryObj<typeof ProgressBar.Root> = {
    render: () => (
        <VStack gap="$300" style={{ width: 320 }}>
            <Bar label="default" value={42} type="default" />
            <Bar label="warning" value={42} type="warning" />
        </VStack>
    ),
};

export const Indeterminate: StoryObj<typeof ProgressBar.Root> = {
    render: () => (
        <div style={{ width: 320 }}>
            <ProgressBar.Root value={null}>
                <ProgressBar.Label>서버 응답 대기 중</ProgressBar.Label>
                <ProgressBar.Value>{() => '처리 중'}</ProgressBar.Value>
                <ProgressBar.Track>
                    <ProgressBar.Indicator />
                </ProgressBar.Track>
            </ProgressBar.Root>
        </div>
    ),
};

/** `Status` is a sibling, never a child: the children of a progressbar are presentational. */
export const CompletionAnnouncement: StoryObj<typeof ProgressBar.Root> = {
    render: () => {
        const [value, setValue] = useState(42);
        const done = value === 100;

        return (
            <VStack gap="$300" style={{ width: 320 }}>
                <Bar label="report.pdf 업로드" value={value} />
                <ProgressBar.Status>{done ? '업로드 완료' : null}</ProgressBar.Status>
                <Button onClick={() => setValue(done ? 42 : 100)}>
                    {done ? '되돌리기' : '완료로 보내기'}
                </Button>
            </VStack>
        );
    },
};

export const TestBed: StoryObj<typeof ProgressBar.Root> = {
    render: () => (
        <VStack gap="$300" style={{ width: 320 }}>
            <Bar label="determinate" value={42} />
            <Bar label="complete" value={100} />
            <Bar label="indeterminate" value={null} />
            <Bar label="warning" value={42} type="warning" />
            <Bar label="clamped (value=150)" value={150} />
        </VStack>
    ),
};
