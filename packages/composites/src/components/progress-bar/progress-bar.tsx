'use client';

import { Box, ProgressBar as ProgressBarPrimitives } from '@vapor-ui/core';
import { WarningIcon } from '@vapor-ui/icons';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

const slots = createSlots({
    label: ProgressBarPrimitives.Label,
    valueText: ProgressBarPrimitives.Value,
    description: ProgressBarPrimitives.Description,
});

/**
 * 다운로드, 업로드, 업데이트처럼 끝이 있는 작업이 얼마나 진행되었는지 보여줍니다.
 * 사용자 수나 저장 공간처럼 끝이 없는 값에는 대신 `Meter`를 사용하세요. `<div>` 요소로 렌더링됩니다.
 */
export const ProgressBar = ({
    // functional
    value,
    max,
    getAriaValueText,

    // variants
    size,
    type,

    // slots
    label,
    valueText,
    description,
}: ProgressBar.Props) => {
    const hasErrorIcon =
        type === 'error' &&
        description !== null &&
        description !== undefined &&
        description !== '' &&
        typeof description !== 'boolean';

    return (
        <ProgressBarPrimitives.Root
            value={value}
            max={max}
            getAriaValueText={getAriaValueText}
            size={size}
            type={type}
        >
            <slots.label render={label} />
            <slots.valueText render={valueText} />
            <ProgressBarPrimitives.Track />
            <slots.description
                render={
                    hasErrorIcon ? (
                        <>
                            <Box
                                render={<span />}
                                $css={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    height: '1lh',
                                }}
                            >
                                <WarningIcon />
                            </Box>
                            {description}
                        </>
                    ) : (
                        description
                    )
                }
                $css={
                    hasErrorIcon
                        ? { display: 'flex', alignItems: 'flex-start', gap: '$050' }
                        : undefined
                }
            />
        </ProgressBarPrimitives.Root>
    );
};

type Slots = SlotProps<typeof slots, 'label'>;
type RootProps = ProgressBarPrimitives.Root.Props;
type ValueProps = ProgressBarPrimitives.Value.Props;
type ValueFormatter = NonNullable<ValueProps['children']>;

export interface ProgressBarProps {
    /**
     * 작업의 현재 진행 값. 네트워크 업로드처럼 남은 양을 알 수 없는 작업이면 `null`을 넘겨 indeterminate 상태로 표시합니다.
     */
    value: RootProps['value'];

    /**
     * 작업이 끝났을 때의 값. `value`가 이 값에 도달하면 완료 상태가 됩니다.
     * @default 100
     */
    max?: RootProps['max'];

    /**
     * 스크린 리더가 읽을 진행 상황 문구를 만드는 함수. `(formattedValue, value)`를 받아 `aria-valuetext`로 쓸 문자열을 반환합니다.
     * 넘기지 않으면 스크린 리더는 `value`를 백분율로 읽습니다. 화면에 보이는 값이 실제 진행률과 다를 때, 예를 들어 `"error"` 상태에서 전체 크기만 보여줄 때 함께 맞추세요.
     * @example
     * <ProgressBar type="error" value={150} max={300} label="report.pdf 다운로드" valueText={() => '300MB'} getAriaValueText={() => '다운로드 실패'} />
     */
    getAriaValueText?: RootProps['getAriaValueText'];

    /**
     * 프로그레스 바가 화면에서 차지하는 비중. 카드나 테이블 행처럼 좁은 공간, 또는 여러 개를 나란히 둘 때는 `sm`을,
     * 화면의 주요 작업이라 진행 상황을 강조해야 할 때는 `lg`를 사용하세요. 트랙 두께만 바뀌고 텍스트 크기는 그대로입니다.
     * @default "md"
     */
    size?: RootProps['size'];

    /**
     * 작업 상태의 톤. `"error"`는 작업이 실패했음을 알리며 인디케이터가 `value`와 상관없이 가득 차고 빨간색으로 바뀝니다.
     * 색만으로는 원인을 알 수 없으니 `description`에 실패 원인과 해결 방법을 함께 적으세요.
     * @default "default"
     */
    type?: RootProps['type'];

    /**
     * 진행 중인 작업의 이름. 프로그레스 바의 접근 가능한 이름이 됩니다.
     * "업로드 중"보다 "report.pdf 업로드"처럼 무엇을 처리하는지 드러나게 쓰세요.
     */
    label: Slots['label'];

    /**
     * 진행 값을 화면에 표시할 텍스트로 바꾸는 함수. `(formattedValue, value)`를 받으며 `formattedValue`는 `"42%"` 형태의 백분율 문자열입니다.
     * `"150MB / 300MB"`처럼 단위가 있는 값을 보여줄 때 사용하고 indeterminate 상태(`value`가 `null`)에서는 `null`을 반환해 값을 숨기세요.
     * 스크린 리더는 이 텍스트가 아니라 `value`를 읽으며, 읽을 문구를 바꾸려면 `getAriaValueText`를 사용하세요.
     * @example
     * <ProgressBar value={150} max={300} label="report.pdf 다운로드" valueText={(_, value) => (value === null ? null : `${value}MB / 300MB`)} />
     * // 실패하면 현재 값 대신 전체 크기만 보여줍니다.
     * <ProgressBar type="error" value={150} max={300} label="report.pdf 다운로드" valueText={() => '300MB'} description="다운로드에 실패했습니다. 네트워크 연결을 확인한 뒤 다시 시도하세요." />
     */
    valueText?: ValueFormatter;

    /**
     * 진행 상황을 보충하는 문장. 작업이 오래 걸리면 진행 단계에 맞춰 문구를 바꾸고("약 3분 남음"), 실패했다면 원인과 해결 방법을 적으세요.
     * `aria-describedby`로 연결됩니다.
     * `type`이 `"error"`면 내용 앞에 항상 경고 아이콘이 붙습니다. 아이콘은 보조 기술에 전달되지 않으니 문장만으로 실패가 드러나게 쓰세요.
     */
    description?: Slots['description'];
}

export namespace ProgressBar {
    export type Props = ProgressBarProps;
}
