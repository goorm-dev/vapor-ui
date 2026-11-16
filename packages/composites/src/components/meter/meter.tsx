'use client';

import type { ReactNode } from 'react';

import { Meter as MeterPrimitives, Text } from '@vapor-ui/core';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

/* -----------------------------------------------------------------------------------------------*/

const slots = createSlots({
    label: MeterPrimitives.Label,
    valueText: MeterPrimitives.Value,
    maxValueText: Text,
});

export const Meter = ({
    // functional
    value,
    min = 0,
    max = 100,
    getAriaValueText,

    // variants
    size,
    type,

    // slots
    label,
    formatValue,
}: Meter.Props) => {
    const renderValue = (formattedValue: string, value: number, max: number) => {
        if (formatValue === false) return '';
        if (!formatValue) return formattedValue;

        const { formattedValueText, valueText, maxValueText } = formatValue;

        if (formattedValueText) {
            return typeof formattedValueText === 'function'
                ? formattedValueText(formattedValue)
                : formattedValueText;
        }

        return (
            <>
                <span>{typeof valueText === 'function' ? valueText(value) : valueText}</span>
                {!!maxValueText && (
                    <>
                        <span>/</span>
                        <span>
                            {typeof maxValueText === 'function' ? maxValueText(max) : maxValueText}
                        </span>
                    </>
                )}
            </>
        );
    };

    return (
        <MeterPrimitives.Root
            value={value}
            min={min}
            max={max}
            getAriaValueText={getAriaValueText}
            size={size}
            type={type}
        >
            <slots.label render={label} />
            <MeterPrimitives.Value $css={{ display: 'flex', gap: '$025', alignItems: 'center' }}>
                {renderValue}
            </MeterPrimitives.Value>

            <MeterPrimitives.TrackPrimitive>
                <MeterPrimitives.IndicatorPrimitive />
            </MeterPrimitives.TrackPrimitive>
        </MeterPrimitives.Root>
    );
};

type Slots = SlotProps<typeof slots, 'label'>;
type RootProps = MeterPrimitives.Root.Props;
type ValueProps = MeterPrimitives.Value.Props;

type ValueChildrenArgs = Parameters<NonNullable<ValueProps['children']>>;
type ValueFormatter<I extends number> = ((value: ValueChildrenArgs[I]) => ReactNode) | ReactNode;

type FormattedValue = ValueFormatter<0>;
type Value = ValueFormatter<1>;
type MaxValue = ValueFormatter<2>;

/**
 * 값 표기 방식의 두 가지 shape.
 * - `formattedValueText`: 단일 포맷터로 전체 텍스트를 렌더한다.
 * - `valueText` + `maxValueText`: 현재 값과 최댓값을 분리해 각각 렌더한다.
 *
 * `never`로 두 그룹의 키를 서로 배제한다.
 */
type FormatValue =
    | { formattedValueText: FormattedValue; valueText?: never; maxValueText?: never }
    | { formattedValueText?: never; valueText: Value; maxValueText?: MaxValue };

export interface MeterProps {
    /**
     * 현재 측정값. `min`과 `max` 사이의 숫자를 전달한다. 접근성 트리의 `aria-valuenow`로 노출된다.
     */
    value: RootProps['value'];

    /**
     * 측정 범위의 최솟값.
     * @default 0
     */
    min?: RootProps['min'];

    /**
     * 측정 범위의 최댓값. `min`보다 커야 한다.
     * @default 100
     */
    max?: RootProps['max'];

    /**
     * 보조 기술에 전달할 사람이 읽기 쉬운 값 문자열을 반환한다. 색상 외의 신호로 상태를 전달하고 싶을 때 사용한다. `aria-valuetext`로 노출된다.
     * @example
     * <Meter getAriaValueText={(formatted, raw) => `${formatted} 사용 중, 경고 범위`} />
     */
    getAriaValueText?: RootProps['getAriaValueText'];

    /**
     * 미터의 크기를 변경한다.
     * @default "md"
     */
    size?: RootProps['size'];

    /**
     * 측정값의 상태를 시각적으로 구분한다. `warning`은 임계 범위에 진입했음을 알린다.
     */
    type: RootProps['type'];

    /**
     * 미터가 측정하는 대상의 이름. 접근성 레이블로 사용되므로 생략하지 않는다.
     */
    label: Slots['label'];

    /**
     * 값 표기 방식을 결정한다. 두 shape 중 하나만 허용되며 두 그룹을 동시에 지정할 수 없다.
     * - `formattedValueText` 단독: 전체 문자열을 반환한다.
     * - `valueText` + `maxValueText` 동시: 현재 값과 최댓값을 분리해 렌더한다.
     *
     * @example
     * <Meter formatValue={{ formattedValueText: (f, v, m) => `${v} / ${m}` }} />
     * @example
     * <Meter
     *   formatValue={{
     *     valueText: (v) => `${v} GB`,
     *     maxValueText: (m) => `${m} GB`,
     *   }}
     * />
     */
    formatValue?: FormatValue | false;
}

export namespace Meter {
    export type Props = MeterProps;
}
