'use client';

import type { ReactNode } from 'react';

import { HStack, Meter as MeterPrimitives } from '@vapor-ui/core';
import { WarningIcon } from '@vapor-ui/icons';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

/* -----------------------------------------------------------------------------------------------*/

const slots = createSlots({
    label: MeterPrimitives.Label,
    description: MeterPrimitives.Description,
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
    description: descriptionProp,
    valueText: valueTextProp,
    maxValueText: maxValueTextProp,
}: Meter.Props) => {
    const valueText = (formattedValue: string, value: number) => {
        if (valueTextProp === false) return '';
        if (!valueTextProp) return formattedValue;
        return valueTextProp(value);
    };

    const maxValueText =
        typeof maxValueTextProp === 'function' ? maxValueTextProp(max) : maxValueTextProp;

    const renderValue = (formattedValue: string, value: number) => {
        return (
            <>
                <span>{valueText(formattedValue, value)}</span>
                {!!maxValueText && (
                    <>
                        <span>/</span>
                        <span>{maxValueText}</span>
                    </>
                )}
            </>
        );
    };

    const hasErrorIcon =
        type === 'warning' &&
        descriptionProp !== null &&
        descriptionProp !== undefined &&
        descriptionProp !== '' &&
        typeof descriptionProp !== 'boolean';

    const errorIcon = hasErrorIcon && (
        <HStack render={<span />} $css={{ alignItems: 'center' }}>
            <WarningIcon />
        </HStack>
    );

    const description = descriptionProp && (
        <>
            {errorIcon}
            {descriptionProp}
        </>
    );

    return (
        <MeterPrimitives.Root
            value={value}
            min={min}
            max={max}
            getAriaValueText={getAriaValueText}
            size={size}
            type={type}
            $css={{
                display: 'grid',
                gridTemplateAreas: "'label value' 'track track' 'description description'",
            }}
        >
            <slots.label render={label} $css={{ gridArea: 'label' }} />
            <MeterPrimitives.Value
                $css={{ display: 'flex', gap: '$025', alignItems: 'center', gridArea: 'value' }}
            >
                {renderValue}
            </MeterPrimitives.Value>

            <MeterPrimitives.TrackPrimitive $css={{ gridArea: 'track' }}>
                <MeterPrimitives.IndicatorPrimitive />
            </MeterPrimitives.TrackPrimitive>

            <slots.description
                render={description}
                $css={{
                    gridArea: 'description',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '$050',
                }}
            />
        </MeterPrimitives.Root>
    );
};

type Slots = SlotProps<typeof slots, 'label'>;
type RootProps = MeterPrimitives.Root.Props;

interface MeterBaseProps {
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
     * 미터의 현재 상태를 설명하는 보조 텍스트. 스크린리더기에 의해 읽히지 않으므로, 필수 정보를 포함하지 않는다.
     */
    description?: Slots['description'];

    /**
     * 화면에 표시할 현재 값 텍스트를 반환한다. 인자로 현재 할당된 `value` 값을 받는다.
     * - `undefined`: 계산된 값(예: `42%`)을 표시한다.
     * - `false`: 값을 표시하지 않는다.
     * @example
     * <Meter valueText={(value) => `${value}GB`} />
     */
    valueText?: ((value: number) => ReactNode) | false;

    /**
     * 최댓값을 표시한다. 현재 값 뒤에서 `/`로 구분하여 표시되며, 함수로 전달하면 `max` 값을 인자로 전달 받는다.
     * `valueText` 함수를 전달할 때만 사용할 수 있다.
     * @example
     * <Meter max={150} valueText={(value) => `${value}GB`} maxValueText={(max) => `${max}GB`} />
     * <Meter max={150} valueText={(value) => `${value}GB`} maxValueText="150GB" />
     */
    maxValueText?: ((max: number) => ReactNode) | ReactNode;
}

/**
 * Type Narrowing
 * `valueText`가 생략되거나 `false`면 `maxValueText`는 `never`가 된다.
 */
type MeterValueTextProps =
    | { valueText: (value: number) => ReactNode }
    | {
          valueText?: false;
          maxValueText?: never;
      };

export type MeterProps = MeterBaseProps & MeterValueTextProps;

export namespace Meter {
    export type Props = MeterProps;
}
