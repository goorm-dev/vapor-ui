'use client';

import { Meter as MeterPrimitives } from '@vapor-ui/core';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

/* -----------------------------------------------------------------------------------------------*/

const slots = createSlots({
    label: MeterPrimitives.Label,
    valueText: MeterPrimitives.Value,
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
    valueText: valueTextProp,
}: Meter.Props) => {
    const valueText = (formattedValue: string, value: number, max: number) =>
        valueTextProp ? valueTextProp(formattedValue, value, max) : formattedValue;

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
            <slots.valueText render={valueText} />
            <MeterPrimitives.TrackPrimitive>
                <MeterPrimitives.IndicatorPrimitive />
            </MeterPrimitives.TrackPrimitive>
        </MeterPrimitives.Root>
    );
};

type Slots = SlotProps<typeof slots, 'label'>;
type RootProps = MeterPrimitives.Root.Props;
type ValueProps = MeterPrimitives.Value.Props;
type ValueFormatter = NonNullable<ValueProps['children']>;

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
     * @default "default"
     */
    type?: RootProps['type'];

    /**
     * 미터가 측정하는 대상의 이름. 접근성 레이블로 사용되므로 생략하지 않는다.
     */
    label: Slots['label'];

    /**
     * 현재 값을 숫자로 표시한다. 기본적으로 비율을 표시하며, 전달 받는 인자를 이용하여 커스텀할 수 있다.
     * @example
     * <Meter valueText={(formattedValue, value, max) => `${value} / ${max} (${formattedValue})`} />
     */
    valueText?: ValueFormatter;
}

export namespace Meter {
    export type Props = MeterProps;
}
