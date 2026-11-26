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
    render: () => {
        const [range, setRange] = useState<CalendarRange>({ start: null, end: null });

        return (
            <Calendar.Root mode="range" value={range} onValueChange={setRange}>
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>
        );
    },
};

// A fixed month far from today, so the today marker never shifts the visual baseline.
const MAY_2020 = new Date(2020, 4, 1);

export const TestBed: StoryObj<typeof Calendar.Root> = {
    render: () => (
        <HStack $css={{ gap: '$400', alignItems: 'flex-start' }}>
            <Calendar.Root defaultMonth={MAY_2020} defaultValue={new Date(2020, 4, 25)}>
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>

            <Calendar.Root
                mode="range"
                defaultMonth={MAY_2020}
                defaultValue={{ start: new Date(2020, 4, 12), end: new Date(2020, 4, 15) }}
            >
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>

            <Calendar.Root
                mode="range"
                defaultMonth={MAY_2020}
                locale="en-US"
                weekStartsOn={1}
                defaultValue={{ start: new Date(2020, 4, 29), end: new Date(2020, 5, 3) }}
            >
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>

            <Calendar.Root defaultMonth={MAY_2020} disabled>
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>
        </HStack>
    ),
};
