import type { Meta, StoryObj } from '@storybook/react-vite';
import { VStack } from '@vapor-ui/core';

import { Regression } from '~/utils/regressions';

import { Meter } from '.';

export default {
    title: 'Composites/Meter',
    component: Meter,
    argTypes: {
        value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        type: { control: 'inline-radio', options: ['default', 'warning'] },
        label: { control: 'text' },
        min: { control: { type: 'range', min: 0 } },
        max: { control: { type: 'range', max: 100 } },
    },
    args: { min: 0, max: 100 },
} satisfies Meta<typeof Meter>;

type Story = StoryObj<typeof Meter>;

export const Default: Story = {
    argTypes: { max: { control: { type: 'range', max: 150 } } },
    args: {
        label: '저장 공간',
        value: 60,
        min: 20,
        max: 150,
        size: 'md',
        type: 'default',
    },
    render: (args) => (
        <VStack $css={{ gap: '$200', width: '320px' }}>
            <Meter {...args} />
        </VStack>
    ),
};

export const CustomValueText: Story = {
    args: {
        label: '배터리 잔량',
        value: 45,
        size: 'md',
        type: 'default',
        valueText: (formatted, raw, value) => `${raw} / ${value} (${formatted})`,
    },
    render: (args) => (
        <VStack $css={{ gap: '$200', width: '320px' }}>
            <Meter {...args} />
        </VStack>
    ),
};

export const WarningState: Story = {
    args: {
        label: '디스크 사용량',
        value: 92,
        size: 'md',
        type: 'warning',
        getAriaValueText: (formatted) => `${formatted} 사용 중, 경고 범위 진입`,
    },
    render: (args) => (
        <VStack $css={{ gap: '$200', width: '320px' }}>
            <Meter {...args} />
        </VStack>
    ),
};

/* -----------------------------------------------------------------------------------------------
 * Test Bed
 * ---------------------------------------------------------------------------------------------- */

const TestBedRender = () => {
    return (
        <Regression.Table
            conditions={[
                {
                    key: 'size',
                    label: 'size',
                    values: ['sm', 'md', 'lg'] as const,
                    format: (v) => `size = ${v}`,
                },
                {
                    key: 'type',
                    label: 'type',
                    values: ['default', 'warning'] as const,
                    format: (v) => `type = ${v}`,
                },
                {
                    key: 'value',
                    label: 'value',
                    values: [0, 25, 50, 75, 100],
                    format: (v) => `value = ${v}`,
                },
                {
                    key: 'hasValueText',
                    label: 'valueText',
                    values: [true, false],
                    format: (v) => `valueText = ${v ? 'O' : 'X'}`,
                },
            ]}
            render={(row) => (
                <div style={{ width: '240px' }}>
                    <Meter
                        label="저장 공간"
                        value={row.value}
                        size={row.size}
                        type={row.type}
                        valueText={row.hasValueText ? (formatted) => `${formatted}` : undefined}
                    />
                </div>
            )}
        />
    );
};

export const TestBed_Light: Story = {
    render: () => <TestBedRender />,
};

export const TestBed_Dark: Story = {
    globals: { appearance: 'dark' },
    render: () => <TestBedRender />,
};
