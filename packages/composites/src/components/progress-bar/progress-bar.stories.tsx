import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@vapor-ui/core';

import { Regression } from '~/utils/regressions';

import { ProgressBar } from '.';

export default {
    title: 'Composites/ProgressBar',
    component: ProgressBar,
    argTypes: {
        value: { control: { type: 'number', min: 0, max: 300 } },
        max: { control: { type: 'number', min: 1 } },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        type: { control: 'inline-radio', options: ['default', 'error'] },
        label: { control: 'text' },
        valueText: { control: false },
        getAriaValueText: { control: false },
        description: { control: 'text' },
    },
    render: (args) => (
        <Box $css={{ width: '320px' }}>
            <ProgressBar {...args} />
        </Box>
    ),
} satisfies Meta<typeof ProgressBar>;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
    args: {
        value: 150,
        max: 300,
        label: 'report.pdf 업로드',
        valueText: (_, value) => (value === null ? null : `${value}MB / 300MB`),
        description: '업로드 중...',
    },
};

export const FormattedValueText: Story = {
    args: {
        value: 42,
        label: 'report.pdf 업로드',
        valueText: (formattedValue, value) => (value === null ? null : formattedValue),
        description: '업로드 중...',
    },
};

/* -----------------------------------------------------------------------------------------------
 * Test Bed
 * ---------------------------------------------------------------------------------------------- */

const valueTexts = {
    percent: (formattedValue, value) => (value === null ? null : formattedValue),
    bytes: (_, value) => (value === null ? null : `${value}MB / 300MB`),
} satisfies Record<string, ProgressBar.Props['valueText']>;

const TestBedRender = () => {
    return (
        <Regression.Table
            conditions={[
                {
                    key: 'size',
                    label: 'size',
                    values: ['sm', 'md', 'lg'],
                    format: (v) => `size = ${v}`,
                },
                {
                    key: 'state',
                    label: 'state',
                    values: ['default', 'indeterminate', 'error'],
                    format: (v) => `state = ${v}`,
                },
                {
                    key: 'valueText',
                    label: 'value text',
                    values: [null, 'percent', 'bytes'],
                    format: (v) => `valueText = ${v ?? 'X'}`,
                },
                {
                    key: 'description',
                    label: 'description',
                    values: ['업로드에 실패했습니다. 파일이 10MB를 넘습니다', null],
                    format: (v) => `description = ${v ? 'O' : 'X'}`,
                },
            ]}
            render={(row) => (
                <Box $css={{ width: '320px' }}>
                    <ProgressBar
                        label="아주 긴 파일명이라 줄바꿈이 일어날 수 있는 레이블 텍스트입니다. report.pdf"
                        value={row.state === 'indeterminate' ? null : 150}
                        max={300}
                        size={row.size}
                        type={row.state === 'error' ? 'error' : 'default'}
                        valueText={row.valueText ? valueTexts[row.valueText] : undefined}
                        description={row.description}
                    />
                </Box>
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
