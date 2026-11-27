import { useState } from 'react';
import type { CSSProperties } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Calendar } from '.';
import type { CalendarRange } from '.';
import { Button } from '../button';
import { HStack } from '../h-stack';
import { Text } from '../text';
import { VStack } from '../v-stack';

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

type MotionCase = 'select' | 'rangePreview' | 'rangeFill';

const MOTION_CASES: Record<
    MotionCase,
    {
        mode: 'single' | 'range';
        css: string;
        verdict: '추천' | '조건부' | '비추천';
        note: string;
    }
> = {
    select: {
        mode: 'single',
        css: `
.motion-select td > button {
    transition-property: background-color, color;
    transition-duration: 100ms;
    transition-timing-function: ease-out;
}
@media (prefers-reduced-motion: reduce) {
    .motion-select td > button { transition: none; }
}`,
        verdict: '추천',
        note: '한 번 누르는 선택이라 짧은 색 전환이 상태 변화를 알려 주고, 이동·확대 없이 색만 바뀌어 산만하지 않습니다.',
    },
    rangePreview: {
        mode: 'range',
        css: `
.motion-rangePreview td > button {
    transition-property: background-color, color;
    transition-duration: 100ms;
    transition-timing-function: ease-out;
}
@media (prefers-reduced-motion: reduce) {
    .motion-rangePreview td > button { transition: none; }
}`,
        verdict: '비추천',
        note: '호버할 때마다 반복되는 고빈도 상호작용이라, 전환이 들어가면 띠가 포인터를 늦게 따라와 보입니다. 즉시 바뀌는 쪽이 낫습니다.',
    },
    rangeFill: {
        mode: 'range',
        css: `
.motion-rangeFill td > button {
    transition-property: background-color, color;
    transition-duration: 100ms;
    transition-timing-function: ease-out;
}
.motion-rangeFill td > button[data-selected] {
    transition-delay: calc(var(--fill-index, 0) * 20ms);
}
@media (prefers-reduced-motion: reduce) {
    .motion-rangeFill td > button,
    .motion-rangeFill td > button[data-selected] { transition: none; }
}`,
        verdict: '비추천',
        note: '마우스로 고를 때는 미리보기가 띠를 이미 칠해 두어 확정 순간 채움이 보이지 않습니다. 값을 밖에서 넣을 때만 보이고, 반복 조작에 순차 지연을 넣으면 응답이 늦게 느껴집니다.',
    },
};

const FILL_RANGE: CalendarRange = { start: new Date(2020, 4, 11), end: new Date(2020, 4, 17) };
const EMPTY_RANGE: CalendarRange = { start: null, end: null };
const MAX_FILL_INDEX = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

const fillIndex = (date: Date, start: Date | null) =>
    start
        ? Math.min(
              MAX_FILL_INDEX,
              Math.max(0, Math.round((date.getTime() - start.getTime()) / DAY_MS)),
          )
        : 0;

const MotionSide = ({ name, motion }: { name: MotionCase; motion: boolean }) => {
    const { mode } = MOTION_CASES[name];
    const fill = name === 'rangeFill';
    const [range, setRange] = useState<CalendarRange>(EMPTY_RANGE);
    const className = motion ? `motion-${name}` : undefined;

    const grid =
        motion && fill ? (
            <Calendar.Grid>
                {(date) => (
                    <Calendar.DayPrimitive
                        date={date}
                        style={{ '--fill-index': fillIndex(date, range.start) } as CSSProperties}
                    />
                )}
            </Calendar.Grid>
        ) : (
            <Calendar.Grid />
        );

    return (
        <VStack $css={{ gap: '$150', alignItems: 'flex-start' }}>
            <Text typography="subtitle1">{motion ? '모션 있음' : '모션 없음'}</Text>
            {fill && (
                <HStack $css={{ gap: '$100' }}>
                    <Button size="sm" variant="outline" onClick={() => setRange(FILL_RANGE)}>
                        5월 11–17일 선택
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRange(EMPTY_RANGE)}>
                        초기화
                    </Button>
                </HStack>
            )}
            {mode === 'single' ? (
                <Calendar.Root className={className} defaultMonth={MAY_2020}>
                    <Calendar.Header />
                    {grid}
                </Calendar.Root>
            ) : (
                <Calendar.Root
                    mode="range"
                    className={className}
                    defaultMonth={MAY_2020}
                    {...(fill ? { value: range, onValueChange: setRange } : {})}
                >
                    <Calendar.Header />
                    {grid}
                </Calendar.Root>
            )}
        </VStack>
    );
};

const MotionCompare = ({ case: name }: { case: MotionCase }) => {
    const { css, verdict, note } = MOTION_CASES[name];

    return (
        <VStack $css={{ gap: '$200', alignItems: 'flex-start' }}>
            <style>{css}</style>
            <VStack $css={{ gap: '$050' }}>
                <Text typography="heading6">판정: {verdict}</Text>
                <Text typography="body2">{note}</Text>
            </VStack>
            <HStack $css={{ gap: '$400', alignItems: 'flex-start' }}>
                <MotionSide name={name} motion={false} />
                <MotionSide name={name} motion />
            </HStack>
        </VStack>
    );
};

export const MotionSelect: StoryObj<typeof Calendar.Root> = {
    render: () => <MotionCompare case="select" />,
};

export const MotionRangePreview: StoryObj<typeof Calendar.Root> = {
    render: () => <MotionCompare case="rangePreview" />,
};

export const MotionRangeFill: StoryObj<typeof Calendar.Root> = {
    render: () => <MotionCompare case="rangeFill" />,
};
