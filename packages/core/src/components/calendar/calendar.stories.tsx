import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Calendar } from '.';
import type { CalendarRange } from '.';
import { HStack } from '../h-stack';

export default {
    title: 'Calendar',
    component: Calendar.Root,
    argTypes: {
        mode: { control: { type: 'inline-radio' }, options: ['single', 'range'] },
        locale: { control: { type: 'text' } },
        weekStartsOn: { control: { type: 'number', min: 0, max: 6 } },
        disabled: { control: { type: 'boolean' } },
    },
} satisfies Meta<typeof Calendar.Root>;

export const Default: StoryObj<typeof Calendar.Root> = {
    args: { mode: 'single' },
    render: (args) => (
        <Calendar.Root {...args}>
            <Calendar.Header />
            <Calendar.Grid />
        </Calendar.Root>
    ),
};

export const Range: StoryObj<typeof Calendar.Root> = {
    render: ({ locale, weekStartsOn, disabled }) => {
        const [range, setRange] = useState<CalendarRange>({ start: null, end: null });

        return (
            <Calendar.Root
                locale={locale}
                weekStartsOn={weekStartsOn}
                disabled={disabled}
                mode="range"
                value={range}
                onValueChange={setRange}
            >
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>
        );
    },
};

const FIXED_MONTH = new Date(2020, 4, 1);

export const TestBed: StoryObj<typeof Calendar.Root> = {
    render: () => (
        <HStack $css={{ gap: '$400', alignItems: 'flex-start' }}>
            <Calendar.Root defaultMonth={FIXED_MONTH} defaultValue={new Date(2020, 4, 25)}>
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>

            <Calendar.Root
                mode="range"
                defaultMonth={FIXED_MONTH}
                defaultValue={{ start: new Date(2020, 4, 12), end: new Date(2020, 4, 15) }}
            >
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>

            <Calendar.Root
                mode="range"
                defaultMonth={FIXED_MONTH}
                locale="en-US"
                weekStartsOn={1}
                defaultValue={{ start: new Date(2020, 4, 29), end: new Date(2020, 5, 3) }}
            >
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>

            <Calendar.Root defaultMonth={FIXED_MONTH} disabled>
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>
        </HStack>
    ),
};
