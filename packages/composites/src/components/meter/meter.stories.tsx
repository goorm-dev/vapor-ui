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
        description: { control: 'text' },
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
        description: '저장 공간에 여유가 있습니다.',
        maxValueText: 0,
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
        min: 0,
        max: 100,
        value: 45,
        size: 'md',
        type: 'default',
        valueText: (value) => `${value} GB`,
        maxValueText: (max) => `${max} GB`,
    },
    render: (args) => (
        <VStack $css={{ gap: '$200', width: '320px' }}>
            <Meter {...args} />
        </VStack>
    ),
};

export const RemoveValueLabel: Story = {
    args: {
        label: '배터리 잔량',
        min: 0,
        max: 100,
        value: 45,
        size: 'md',
        type: 'default',
        valueText: false,
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
        description: '데이터 사용량이 많습니다. 파일을 정리해주세요.',
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

const LONG_LABEL = '팀 전체 워크스페이스와 공유 첨부파일이 이번 결제 주기 동안 사용한 저장 공간';
const LONG_DESCRIPTION =
    '저장 공간이 거의 가득 찼습니다. 오래된 파일을 정리하거나 요금제를 변경해 저장 공간을 확보해주세요.';

const valueTextCases = {
    default: {},
    hidden: { valueText: false },
    custom: { valueText: (value: number) => `${value}GB` },
    'custom + max': {
        valueText: (value: number) => `${value}GB`,
        maxValueText: (max: number) => `${max}GB`,
    },
} as const;

const TestBedRender = () => {
    return (
        <VStack $css={{ gap: '$400' }}>
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
                        values: [0, 50, 100],
                        format: (v) => `value = ${v}`,
                    },
                    {
                        key: 'description',
                        label: 'description',
                        values: ['저장 공간에 여유가 있습니다.', undefined],
                        format: (v) => `description = ${v ? 'O' : 'X'}`,
                    },
                ]}
                render={(row) => (
                    <div style={{ width: '240px' }}>
                        <Meter
                            label="저장 공간"
                            value={row.value}
                            size={row.size}
                            type={row.type}
                            description={row.description}
                        />
                    </div>
                )}
            />
            <Regression.Table
                conditions={[
                    {
                        key: 'valueText',
                        label: 'valueText',
                        values: ['default', 'hidden', 'custom', 'custom + max'] as const,
                        format: (v) => `valueText = ${v}`,
                    },
                ]}
                render={(row) => (
                    <div style={{ width: '240px' }}>
                        <Meter
                            label="저장 공간"
                            type="default"
                            value={45}
                            max={150}
                            {...valueTextCases[row.valueText]}
                        />
                    </div>
                )}
            />
            <Regression.Table
                conditions={[
                    {
                        key: 'type',
                        label: 'type',
                        values: ['default', 'warning'] as const,
                        format: (v) => `type = ${v}`,
                    },
                    {
                        key: 'content',
                        label: 'content',
                        values: ['long label', 'long description'] as const,
                        format: (v) => `content = ${v}`,
                    },
                ]}
                render={(row) => (
                    <div style={{ width: '240px' }}>
                        <Meter
                            label={row.content === 'long label' ? LONG_LABEL : '저장 공간'}
                            value={92}
                            type={row.type}
                            description={
                                row.content === 'long description'
                                    ? LONG_DESCRIPTION
                                    : '저장 공간을 확인해주세요.'
                            }
                        />
                    </div>
                )}
            />
        </VStack>
    );
};

export const TestBed_Light: Story = {
    render: () => <TestBedRender />,
};

export const TestBed_Dark: Story = {
    globals: { appearance: 'dark' },
    render: () => <TestBedRender />,
};
