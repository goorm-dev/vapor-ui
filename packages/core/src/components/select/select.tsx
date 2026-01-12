'use client';

import type { ReactElement, ReactNode } from 'react';
import { forwardRef } from 'react';

import { Select as BaseSelect, useRender } from '@base-ui-components/react';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './select.css';
import type { TriggerVariants } from './select.css';

type SelectVariants = TriggerVariants;
type SelectSharedProps = SelectVariants & {
    placeholder?: ReactNode;
};

type SelectContext = SelectSharedProps & Pick<SelectRoot.Props, 'items' | 'required'>;

const [SelectProvider, useSelectContext] = createContext<SelectContext>({
    name: 'SelectContext',
    providerName: 'SelectProvider',
    hookName: 'useSelectContext',
});

/* -------------------------------------------------------------------------------------------------
 * Select.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root component of Select that manages the selection state and provides context. Renders a `<div>` element.
 */
export const SelectRoot = (props: SelectRoot.Props) => {
    const [sharedProps, otherProps] = createSplitProps<SelectSharedProps>()(props, [
        'placeholder',
        'size',
        'invalid',
    ]);

    const { items, required } = otherProps;

    return (
        <SelectProvider value={{ items, required, ...sharedProps }}>
            <BaseSelect.Root {...otherProps} multiple={false} />
        </SelectProvider>
    );
};
SelectRoot.displayName = 'Select.Root';

/* -------------------------------------------------------------------------------------------------
 * Select.TriggerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Primitive trigger button that opens the Select dropdown. Renders a `<button>` element.
 */
export const SelectTriggerPrimitive = forwardRef<HTMLButtonElement, SelectTriggerPrimitive.Props>(
    (props, ref) => {
        const {
            render = <button />,
            nativeButton = true,
            className,
            ...componentProps
        } = resolveStyles(props);

        const { size, invalid, required } = useSelectContext();
        const dataAttrs = createDataAttributes({ required, invalid });

        return (
            <BaseSelect.Trigger
                ref={ref}
                render={render}
                nativeButton={nativeButton}
                aria-required={required || undefined}
                aria-invalid={invalid || undefined}
                className={clsx(styles.trigger({ size, invalid }), className)}
                {...dataAttrs}
                {...componentProps}
            />
        );
    },
);
SelectTriggerPrimitive.displayName = 'Select.TriggerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.ValuePrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Displays the currently selected value or placeholder. Renders a `<span>` element.
 */
export const SelectValuePrimitive = forwardRef<HTMLSpanElement, SelectValuePrimitive.Props>(
    (props, ref) => {
        const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
        const { items, size, placeholder } = useSelectContext();

        const renderValue = (value: string) => {
            if (!items) return value;

            if (Array.isArray(items)) return items.find((item) => item.value === value)?.label;

            return (items as Record<string, ReactNode>)[value];
        };

        const children = (value: string) =>
            typeof childrenProp === 'function'
                ? childrenProp(value)
                : (childrenProp ??
                  renderValue(value) ?? (
                      <SelectPlaceholderPrimitive>{placeholder}</SelectPlaceholderPrimitive>
                  ));

        return (
            <BaseSelect.Value
                ref={ref}
                className={clsx(styles.value({ size }), className)}
                {...componentProps}
            >
                {children}
            </BaseSelect.Value>
        );
    },
);
SelectValuePrimitive.displayName = 'Select.ValuePrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.PlaceholderPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Placeholder text displayed when no value is selected. Renders a `<span>` element.
 */
export const SelectPlaceholderPrimitive = forwardRef<
    HTMLSpanElement,
    SelectPlaceholderPrimitive.Props
>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Value
            ref={ref}
            className={clsx(styles.placeholder, className)}
            {...componentProps}
        />
    );
});
SelectPlaceholderPrimitive.displayName = 'Select.PlaceholderPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.TriggerIconPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Icon displayed in the trigger button, typically a chevron. Renders a `<div>` element.
 */
export const SelectTriggerIconPrimitive = forwardRef<
    HTMLDivElement,
    SelectTriggerIconPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size } = useSelectContext();

    const children = useRender({
        render: createRender(childrenProp, <ChevronDownOutlineIcon />),
    });

    return (
        <BaseSelect.Icon
            ref={ref}
            className={clsx(styles.triggerIcon({ size }), className)}
            {...componentProps}
        >
            {children}
        </BaseSelect.Icon>
    );
});
SelectTriggerIconPrimitive.displayName = 'Select.TriggerIconPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * Composed trigger component that includes value display and icon. Renders a `<button>` element.
 */
export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerPrimitive.Props>(
    (props, ref) => {
        return (
            <SelectTriggerPrimitive ref={ref} {...props}>
                <SelectValuePrimitive />
                <SelectTriggerIconPrimitive />
            </SelectTriggerPrimitive>
        );
    },
);
SelectTrigger.displayName = 'Select.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Select.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const SelectPortalPrimitive = (props: SelectPortalPrimitive.Props) => {
    return <BaseSelect.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Select.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Positions the dropdown popup relative to the trigger. Renders a `<div>` element.
 */
export const SelectPositionerPrimitive = forwardRef<
    HTMLDivElement,
    SelectPositionerPrimitive.Props
>((props, ref) => {
    const {
        side = 'bottom',
        align = 'start',
        sideOffset = 4,
        alignItemWithTrigger = false,
        className,
        ...componentProps
    } = resolveStyles(props);

    return (
        <BaseSelect.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            alignItemWithTrigger={alignItemWithTrigger}
            className={clsx(styles.positioner, className)}
            {...componentProps}
        />
    );
});
SelectPositionerPrimitive.displayName = 'Select.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Dropdown popup container that displays the list of options. Renders a `<div>` element.
 */
export const SelectPopupPrimitive = forwardRef<HTMLDivElement, SelectPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseSelect.Popup
                ref={ref}
                className={clsx(styles.popup, className)}
                {...componentProps}
            />
        );
    },
);
SelectPopupPrimitive.displayName = 'Select.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Composed popup component that includes portal, positioner, and popup primitive. Renders a `<div>` element.
 */
export const SelectPopup = forwardRef<HTMLDivElement, SelectPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <SelectPopupPrimitive ref={ref} {...props} />;

        const positioner = useRender({
            render: createRender(positionerElement, <SelectPositionerPrimitive />),
            props: { children: popup },
        });

        const portal = useRender({
            render: createRender(portalElement, <SelectPortalPrimitive />),
            props: { children: positioner },
        });

        return portal;
    },
);
SelectPopup.displayName = 'Select.Popup';

/* -------------------------------------------------------------------------------------------------
 * Select.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Primitive selectable option item in the dropdown list. Renders a `<div>` element.
 */
export const SelectItemPrimitive = forwardRef<HTMLDivElement, SelectItemPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseSelect.Item
                ref={ref}
                className={clsx(styles.item, className)}
                {...componentProps}
            />
        );
    },
);
SelectItemPrimitive.displayName = 'Select.ItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.ItemIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Visual indicator displayed for the selected item. Renders a `<span>` element.
 */
export const SelectItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    SelectItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const children = useRender({
        render: createRender(childrenProp, <ConfirmOutlineIcon />),
    });

    return (
        <BaseSelect.ItemIndicator
            ref={ref}
            className={clsx(styles.itemIndicator, className)}
            {...componentProps}
        >
            {children}
        </BaseSelect.ItemIndicator>
    );
});
SelectItemIndicatorPrimitive.displayName = 'Select.ItemIndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.Item
 * -----------------------------------------------------------------------------------------------*/

/**
 * Composed selectable item that includes indicator. Renders a `<div>` element.
 */
export const SelectItem = forwardRef<HTMLDivElement, SelectItem.Props>((props, ref) => {
    const { children, ...componentProps } = props;

    return (
        <SelectItemPrimitive ref={ref} {...componentProps}>
            {children}

            <SelectItemIndicatorPrimitive />
        </SelectItemPrimitive>
    );
});
SelectItem.displayName = 'Select.Item';

/* -------------------------------------------------------------------------------------------------
 * Select.Group
 * -----------------------------------------------------------------------------------------------*/

/**
 * Groups related select items together. Renders a `<div>` element.
 */
export const SelectGroup = forwardRef<HTMLDivElement, SelectGroup.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseSelect.Group ref={ref} {...componentProps} />;
});
SelectGroup.displayName = 'Select.Group';

/* -------------------------------------------------------------------------------------------------
 * Select.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

/**
 * Label for a group of select items. Renders a `<div>` element.
 */
export const SelectGroupLabel = forwardRef<HTMLDivElement, SelectGroupLabel.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.GroupLabel
            ref={ref}
            className={clsx(styles.groupLabel, className)}
            {...componentProps}
        />
    );
});
SelectGroupLabel.displayName = 'Select.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * Select.Separator
 * -----------------------------------------------------------------------------------------------*/

/**
 * Visual separator between groups or items. Renders a `<div>` element.
 */
export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparator.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Separator
            ref={ref}
            className={clsx(styles.separator, className)}
            {...componentProps}
        />
    );
});
SelectSeparator.displayName = 'Select.Separator';

/* -----------------------------------------------------------------------------------------------*/

export namespace SelectRoot {
    type RootPrimitiveProps = Omit<VComponentProps<typeof BaseSelect.Root>, 'multiple'>;
    export interface Props extends RootPrimitiveProps, SelectSharedProps {}
    export type ChangeEventDetails = BaseSelect.Root.ChangeEventDetails;
}

export namespace SelectTriggerPrimitive {
    type TriggerPrimitiveProps = VComponentProps<typeof BaseSelect.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace SelectTrigger {
    export interface Props extends SelectTriggerPrimitive.Props {}
}

export namespace SelectValuePrimitive {
    type ValuePrimitiveProps = VComponentProps<typeof BaseSelect.Value>;
    export interface Props extends ValuePrimitiveProps {}
}

export namespace SelectPlaceholderPrimitive {
    type PlaceholderPrimitiveProps = VComponentProps<'span'>;
    export interface Props extends PlaceholderPrimitiveProps {}
}

export namespace SelectTriggerIconPrimitive {
    type TriggerIconPrimitiveProps = VComponentProps<typeof BaseSelect.Icon>;
    export interface Props extends TriggerIconPrimitiveProps {}
}

export namespace SelectPortalPrimitive {
    type PortalPrimitiveProps = VComponentProps<typeof BaseSelect.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace SelectPositionerPrimitive {
    type PositionerPrimitiveProps = VComponentProps<typeof BaseSelect.Positioner>;
    export interface Props extends PositionerPrimitiveProps {}
}

export namespace SelectPopupPrimitive {
    type PopupPrimitiveProps = VComponentProps<typeof BaseSelect.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace SelectPopup {
    type ContentPrimitiveProps = VComponentProps<typeof SelectPopupPrimitive>;
    export interface Props extends ContentPrimitiveProps {
        portalElement?: ReactElement<SelectPortalPrimitive.Props>;
        positionerElement?: ReactElement<SelectPositionerPrimitive.Props>;
    }
}

export namespace SelectItemPrimitive {
    type ItemPrimitiveProps = VComponentProps<typeof BaseSelect.Item>;
    export interface Props extends ItemPrimitiveProps {}
}

export namespace SelectItem {
    export interface Props extends SelectItemPrimitive.Props {}
}

export namespace SelectItemIndicatorPrimitive {
    type ItemIndicatorPrimitiveProps = VComponentProps<typeof BaseSelect.ItemIndicator>;
    export interface Props extends ItemIndicatorPrimitiveProps {}
}

export namespace SelectGroup {
    type GroupPrimitiveProps = VComponentProps<typeof BaseSelect.Group>;
    export interface Props extends GroupPrimitiveProps {}
}

export namespace SelectGroupLabel {
    type GroupLabelPrimitiveProps = VComponentProps<typeof BaseSelect.GroupLabel>;
    export interface Props extends GroupLabelPrimitiveProps {}
}

export namespace SelectSeparator {
    type SeparatorPrimitiveProps = VComponentProps<typeof BaseSelect.Separator>;
    export interface Props extends SeparatorPrimitiveProps {}
}
