'use client';

import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { useControlled } from '@base-ui/utils/useControlled';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { assignInlineVars } from '@vanilla-extract/dynamic';

import { useForcedRerendering } from '~/hooks/use-forced-rerendering';
import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useRenderElement } from '~/hooks/use-render-element';
import { useResizeNotifier } from '~/hooks/use-resize-notifier';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './segmented-control.css';
import type { RootVariants } from './segmented-control.css';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Context
 * -----------------------------------------------------------------------------------------------*/

type SegmentedControlContext = RootVariants & {
    rootElement: HTMLElement | null;
    getItemElementBySelectedValue: (value: string) => HTMLElement | undefined;
    registerItem: (value: string, element: HTMLElement, disabled: boolean) => void;
    unregisterItem: (value: string) => void;
    registerIndicatorUpdateListener: (listener: () => void) => () => void;
    value: string | undefined;
};

const [SegmentedControlProvider, useSegmentedControlContext] =
    createContext<SegmentedControlContext>({
        name: 'SegmentedControlContext',
        hookName: 'useSegmentedControlContext',
        providerName: 'SegmentedControlProvider',
    });

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.RootPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Group of segments for switching between a few options or views, where only one segment is selected at a time. Has no sliding indicator of its own; add `SegmentedControl.IndicatorPrimitive` inside it to highlight the selection. Renders a `<div>` element.
 */
export const SegmentedControlRootPrimitive = forwardRef<
    HTMLDivElement,
    SegmentedControlRootPrimitive.Props
>((props, ref) => {
    const hasExplicitDefaultValueProp = 'defaultValue' in props;

    const {
        className,
        children,
        value: valueProp,
        defaultValue,
        onValueChange,
        ...componentProps
    } = resolveStyles(props);

    const [variantProps, otherProps] = createSplitProps<RootVariants>()(componentProps, ['size']);

    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
    const [itemMap, setItemMap] = useState<
        Map<string, { element: HTMLElement; disabled: boolean }>
    >(() => new Map());

    const isControlled = valueProp !== undefined;

    const [value, setValue] = useControlled<string | undefined>({
        controlled: valueProp,
        default: defaultValue ?? '',
        name: 'SegmentedControl',
        state: 'value',
    });

    const { registerListener, observeElement, unobserveElement } = useResizeNotifier(rootElement);

    const registerItem = useCallback(
        (itemValue: string, element: HTMLElement, disabled: boolean) => {
            setItemMap((prev) => new Map(prev).set(itemValue, { element, disabled }));
            observeElement(element);
        },
        [observeElement],
    );

    const unregisterItem = useCallback(
        (itemValue: string) => {
            setItemMap((prev) => {
                const item = prev.get(itemValue);
                if (item) unobserveElement(item.element);

                const next = new Map(prev);
                next.delete(itemValue);

                return next;
            });
        },
        [unobserveElement],
    );

    const getItemElementBySelectedValue = useCallback(
        (selectedValue: string) => itemMap.get(selectedValue)?.element,
        [itemMap],
    );

    const firstEnabledItemValue = useMemo(() => {
        for (const [itemValue, { disabled }] of itemMap.entries()) {
            if (!disabled) return itemValue;
        }
        return undefined;
    }, [itemMap]);

    useIsoLayoutEffect(() => {
        if (isControlled || itemMap.size === 0) return;

        const selectedItem = value !== undefined ? itemMap.get(value) : undefined;
        const selectionIsDisabled = selectedItem?.disabled === true;
        const selectionIsMissing = selectedItem === undefined && value !== undefined;
        const hasNoSelection = value === undefined;

        if (hasExplicitDefaultValueProp && selectionIsDisabled && value === defaultValue) return;
        if (!hasNoSelection && !selectionIsDisabled && !selectionIsMissing) return;

        setValue(firstEnabledItemValue);
    }, [
        defaultValue,
        firstEnabledItemValue,
        hasExplicitDefaultValueProp,
        isControlled,
        itemMap,
        setValue,
        value,
    ]);

    const handleValueChange = useCallback(
        (selectedValue: string, eventDetails: SegmentedControlRoot.ChangeEventDetails) => {
            setValue(selectedValue);
            onValueChange?.(selectedValue, eventDetails);
        },
        [onValueChange, setValue],
    );

    const composedRef = useMergedRefs(setRootElement, ref);

    const { size } = variantProps;

    return (
        <SegmentedControlProvider
            value={{
                rootElement,
                getItemElementBySelectedValue,
                registerItem,
                unregisterItem,
                registerIndicatorUpdateListener: registerListener,
                value,
                size,
            }}
        >
            <BaseRadioGroup
                ref={composedRef}
                value={value}
                onValueChange={handleValueChange}
                className={cn(styles.root(variantProps), className)}
                {...otherProps}
            >
                {children}
            </BaseRadioGroup>
        </SegmentedControlProvider>
    );
});
SegmentedControlRootPrimitive.displayName = 'SegmentedControl.Root';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `SegmentedControl.RootPrimitive` and `SegmentedControl.IndicatorPrimitive` into a single part. Use `indicatorElement` to replace the indicator. Renders a `<div>` element.
 */
export const SegmentedControlRoot = forwardRef<HTMLDivElement, SegmentedControlRoot.Props>(
    (props, ref) => {
        const { indicatorElement, children, ...componentProps } = resolveStyles(props);

        return (
            <SegmentedControlRootPrimitive ref={ref} {...componentProps}>
                {children}

                {indicatorElement ?? <SegmentedControlIndicatorPrimitive />}
            </SegmentedControlRootPrimitive>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Item
 * -----------------------------------------------------------------------------------------------*/

/**
 * Selectable segment of a segmented control, labeled with text or with text and an icon. Renders a `<button>` element.
 */
export const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItem.Props>(
    (props, ref) => {
        const { render, value, disabled, className, ...componentProps } = resolveStyles(props);
        const { registerItem, unregisterItem, size } = useSegmentedControlContext()!;

        const internalRef = useRef<HTMLElement | null>(null);
        const composedRef = useMergedRefs(internalRef, ref);

        useIsoLayoutEffect(() => {
            const el = internalRef.current;
            if (!el || value === undefined) return;

            registerItem(value, el, disabled ?? false);
            return () => unregisterItem(value);
        }, [value, disabled, registerItem, unregisterItem]);

        return (
            <BaseRadio.Root
                ref={composedRef}
                render={render ?? <button />}
                value={value}
                disabled={disabled}
                nativeButton={true}
                className={cn(styles.item({ size }), className)}
                {...componentProps}
            />
        );
    },
);
SegmentedControlItem.displayName = 'SegmentedControl.Item';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.IconOnlyItem
 * -----------------------------------------------------------------------------------------------*/

/**
 * Square segment of a segmented control that holds only an icon, with no label text. Renders a `<button>` element.
 */
export const SegmentedControlIconItem = forwardRef<HTMLButtonElement, SegmentedControlItem.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { size } = useSegmentedControlContext()!;

        return (
            <SegmentedControlItem
                ref={ref}
                className={cn(styles.iconItem({ size }), className)}
                {...componentProps}
            />
        );
    },
);
SegmentedControlIconItem.displayName = 'SegmentedControl.IconOnlyItem';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Indicator
 * -----------------------------------------------------------------------------------------------*/

/**
 * Highlight that slides to the selected segment and matches its width. Hidden from assistive technologies. Renders a `<div>` element.
 */
export const SegmentedControlIndicatorPrimitive = forwardRef<
    HTMLDivElement,
    SegmentedControlIndicatorPrimitive.Props
>((props, ref) => {
    const { render, className, style, ...componentProps } = resolveStyles(props);
    const { rootElement, getItemElementBySelectedValue, value, registerIndicatorUpdateListener } =
        useSegmentedControlContext()!;

    useForcedRerendering(registerIndicatorUpdateListener);

    const selectedElement = value !== undefined ? getItemElementBySelectedValue(value) : undefined;

    let left = 0;
    let width = 0;

    if (selectedElement && rootElement) {
        const rootRect = rootElement.getBoundingClientRect();
        const itemRect = selectedElement.getBoundingClientRect();

        const rootOffsetWidth = rootElement.offsetWidth;
        const itemLeftDelta = itemRect.left - rootRect.left;

        const scaleX = rootOffsetWidth > 0 ? rootRect.width / rootOffsetWidth : 1;

        left = itemLeftDelta / scaleX + rootElement.scrollLeft - rootElement.clientLeft;
        width = itemRect.width / scaleX;
    }

    const cssVariables = useMemo(
        () =>
            assignInlineVars({
                [styles.variables.indicatorLeft]: `${left}px`,
                [styles.variables.indicatorWidth]: `${width}px`,
            }),
        [left, width],
    );

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            role: 'presentation',
            'aria-hidden': true,
            hidden: !selectedElement,
            className: cn(styles.indicator, className),
            style: { ...cssVariables, ...style },
            ...componentProps,
        },
    });
});
SegmentedControlIndicatorPrimitive.displayName = 'SegmentedControl.Indicator';

/* -----------------------------------------------------------------------------------------------*/

export type SegmentedControlVariants = RootVariants;

export interface SegmentedControlRootPrimitiveProps extends Omit<
    VaporUIComponentProps<typeof BaseRadioGroup, SegmentedControlRootPrimitive.State>,
    'onValueChange'
> {
    /**
     * Value of the selected segment, for a controlled segmented control. Use with `onValueChange` to update it when the user selects a segment.
     */
    value?: string;
    /**
     * Value of the segment selected on first render, for an uncontrolled segmented control. Must match the `value` of a `SegmentedControl.Item`. When it is not set or matches no segment, the first enabled segment is selected.
     */
    defaultValue?: string;
    /**
     * Called when the user selects a different segment by clicking it or with the arrow keys. Receives the new value and the change event details.
     */
    onValueChange?: (
        value: string,
        eventDetails: SegmentedControlRootPrimitive.ChangeEventDetails,
    ) => void;
}

export namespace SegmentedControlRootPrimitive {
    export type State = BaseRadioGroup.State;
    export type Props = SegmentedControlVariants & SegmentedControlRootPrimitiveProps;

    export type ChangeEventDetails = BaseRadioGroup.ChangeEventDetails;
}

export interface SegmentedControlRootProps extends SegmentedControlRootPrimitive.Props {
    /**
     * Replaces the default `SegmentedControl.IndicatorPrimitive`. Use to change the look of the sliding highlight.
     */
    indicatorElement?: ReactElement<SegmentedControlIndicatorPrimitive.Props>;
}

export namespace SegmentedControlRoot {
    export type State = SegmentedControlRootPrimitive.State;
    export type Props = SegmentedControlRootProps;
    export type ChangeEventDetails = SegmentedControlRootPrimitive.ChangeEventDetails;
}

export interface SegmentedControlItemProps extends VaporUIComponentProps<
    typeof BaseRadio.Root,
    SegmentedControlItem.State
> {
    /**
     * Value that identifies the segment when it is selected. Must be unique within the segmented control.
     */
    value: string;
    /**
     * Content shown inside the segment, such as a label or an icon.
     */
    children?: BaseRadio.Root.Props['children'];
}

export namespace SegmentedControlItem {
    export type State = BaseRadio.Root.State;
    export type Props = SegmentedControlItemProps;
}

export namespace SegmentedControlIconItem {
    export type State = SegmentedControlItem.State;
    export type Props = SegmentedControlItem.Props;
}

export namespace SegmentedControlIndicatorPrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}
