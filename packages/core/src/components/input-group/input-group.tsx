'use client';

import { forwardRef, useMemo } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Button } from '../button';
import { IconButton } from '../icon-button';
import { TextInput } from '../text-input';
import type { RootVariants } from './input-group.css';
import * as styles from './input-group.css';

interface InputGroupContextValue {
    disabled?: boolean;
    readOnly?: boolean;
}

const [InputGroupProvider, useInputGroupContext] = createContext<InputGroupContextValue>({
    name: 'InputGroupContext',
    providerName: 'InputGroup.Root',
    hookName: 'useInputGroupContext',
    strict: false,
});

/**
 *
 * Groups a text input with leading and trailing addons or buttons into a single field, and shares its `disabled` and `readOnly` state with the controls inside. Renders a `<div>` element.
 */
export const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupRoot.Props>((props, ref) => {
    const { className, render, ...componentProps } = resolveStyles(props);

    const [{ size = 'md', disabled = false, readOnly = false }, otherProps] =
        createSplitProps<InputGroupRoot.VariantProps>()(componentProps, [
            'size',
            'disabled',
            'readOnly',
        ]);

    const dataAttrs = createDataAttributes({ disabled, readOnly });

    const state: InputGroupRoot.State = useMemo(
        () => ({ disabled, readOnly }),
        [disabled, readOnly],
    );

    const contextValue = useMemo<InputGroupContextValue>(
        () => ({ disabled, readOnly }),
        [disabled, readOnly],
    );

    const element = useRenderElement({
        ref,
        state,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.root({ size }), className),
            ...dataAttrs,
            ...otherProps,
        },
    });

    return <InputGroupProvider value={contextValue}>{element}</InputGroupProvider>;
});
InputGroupRoot.displayName = 'InputGroup.Root';

/**
 *
 * The primary input of the group, inheriting the group's shared `disabled` and `readOnly` state. Renders an `<input>` element by default.
 */
export const InputGroupInput = forwardRef<HTMLElement, InputGroupInput.Props>((props, ref) => {
    const { className, render, ...componentProps } = resolveStyles(props);
    const group = useInputGroupContext();

    const disabled = (componentProps.disabled as boolean | undefined) || group?.disabled;
    const readOnly = (componentProps.readOnly as boolean | undefined) || group?.readOnly;

    return useRenderElement({
        ref,
        render: render ?? <TextInput />,
        props: { ...componentProps, className: cn(styles.input, className), disabled, readOnly },
    });
});
InputGroupInput.displayName = 'InputGroup.Input';

/* -------------------------------------------------------------------------------------------------
 * InputGroup.Button / InputGroup.IconButton — 그룹 내 인터랙티브 버튼 래퍼.
 * 둘 다 addon 슬롯 안에 nesting 되며 layer/상태 정의를 공유한다(4-layer 전부 render 대상이 소유).
 * Button 은 기본 render=Button, IconButton 은 기본 render=IconButton(compact 아이콘). Select 편입은
 * <InputGroup.Button render={<Select.Trigger/>}> 로. 높이는 그룹이 compact 로 강제하되, 그 외
 * 시각(면·hover)은 render 대상이 유지한다 — Button/IconButton 은 surface-stripped 대상이 아니다.
 * context 의 disabled 만 OR 병합한다(readOnly 미소비 → password 토글·clear 는 readOnly 에서 생존).
 * -----------------------------------------------------------------------------------------------*/

/**
 *
 * An interactive button inside the group, such as a clear or password-toggle control, inheriting the group's shared `disabled` state. Renders a `<button>` element by default.
 */
export const InputGroupButton = forwardRef<HTMLElement, InputGroupButton.Props>((props, ref) => {
    const { className, render, children, ...componentProps } = resolveStyles(props);
    const group = useInputGroupContext();

    const disabled = (componentProps.disabled as boolean | undefined) || group?.disabled;

    return useRenderElement({
        ref,
        render: render ?? <Button />,
        props: { ...componentProps, className: cn(styles.button, className), disabled, children },
    });
});
InputGroupButton.displayName = 'InputGroup.Button';

/**
 *
 * A compact icon button inside the group, such as a clear or password-toggle control, inheriting the group's shared `disabled` state. Renders an `IconButton` (a `<button>`) sized to the group's compact density by default.
 */
export const InputGroupIconButton = forwardRef<HTMLElement, InputGroupIconButton.Props>(
    (props, ref) => {
        const { className, render, children, ...componentProps } = resolveStyles(props);
        const group = useInputGroupContext();

        const disabled = (componentProps.disabled as boolean | undefined) || group?.disabled;

        return useRenderElement({
            ref,
            render: render ?? <IconButton />,
            props: {
                ...componentProps,
                className: cn(styles.button, className),
                disabled,
                children,
            },
        });
    },
);
InputGroupIconButton.displayName = 'InputGroup.IconButton';

// 부가요소 슬롯. 그룹 내부 시각은 input-group.css.ts 의 후손 오버라이드가 전담한다.
const createAddon = (displayName: string) => {
    const Addon = forwardRef<HTMLSpanElement, InputGroupAddon.Props>((props, ref) => {
        const { className, render, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'span',
            props: {
                className: cn(styles.addon, className),
                ...componentProps,
            },
        });
    });
    Addon.displayName = displayName;
    return Addon;
};

/**
 *
 * A non-interactive slot rendered before the input for an icon or short text label. Renders a `<span>` element.
 */
export const InputGroupLeadingAddon = createAddon('InputGroup.LeadingAddon');
/**
 *
 * A non-interactive slot rendered after the input for an icon or short text label. Renders a `<span>` element.
 */
export const InputGroupTrailingAddon = createAddon('InputGroup.TrailingAddon');

/* -----------------------------------------------------------------------------------------------*/

export namespace InputGroupRoot {
    export type VariantProps = RootVariants;
    export interface State {
        [key: string]: unknown;
        /** Whether the group shows its disabled visual. */
        disabled: boolean;
        /** Whether the group shows its read-only visual. */
        readOnly: boolean;
    }
    export interface Props extends VaporUIComponentProps<'div', State>, VariantProps {}
}

export namespace InputGroupInput {
    export type State = {};
    /** invalid 는 render 대상(기본 TextInput)의 variant 로 넘어간다 — 이 컨트롤 자신이 aria-invalid 를 소유. */
    export type Props = VaporUIComponentProps<'input', State> & { invalid?: boolean };
}

export namespace InputGroupButton {
    export type State = {};
    export type Props = VaporUIComponentProps<'button', State>;
}

export namespace InputGroupIconButton {
    export type State = {};
    // IconButton 의 variant/colorPalette/shape/size 는 그대로 노출하되, render 만 그룹 래퍼가
    // 소비하는 제네릭 시그니처로 교체한다(IconButton.Props 의 render 는 Button state 에 묶여 있어
    // useRenderElement 와 어긋난다).
    export type Props = Omit<IconButton.Props, 'render'> & Pick<InputGroupButton.Props, 'render'>;
}

export namespace InputGroupAddon {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}
