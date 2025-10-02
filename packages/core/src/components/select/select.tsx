'use client';

import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Select as BaseSelect } from '@base-ui-components/react';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import * as styles from './select.css';
import type { TriggerVariants } from './select.css';

type SelectVariants = TriggerVariants;
type SelectSharedProps = SelectVariants & {
    placeholder?: ReactNode;
};

type SelectContext = SelectSharedProps & Pick<RootPrimitiveProps, 'items'>;

const [SelectProvider, useSelectContext] = createContext<SelectContext>({
    name: 'SelectContext',
    providerName: 'SelectProvider',
    hookName: 'useSelectContext',
});

/* -------------------------------------------------------------------------------------------------
 * Select.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = Omit<VComponentProps<typeof BaseSelect.Root>, 'multiple'>;
interface SelectRootProps extends RootPrimitiveProps, SelectSharedProps {}

/**
 * Provides the root context for a select dropdown with single selection. Renders a <div> element.
 */
const Root = ({ items, ...props }: SelectRootProps) => {
    const [sharedProps, otherProps] = createSplitProps<SelectSharedProps>()(props, [
        'placeholder',
        'size',
        'invalid',
    ]);

    return (
        <SelectProvider value={{ items, ...sharedProps }}>
            <BaseSelect.Root items={items} {...otherProps} multiple={false} />
        </SelectProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Select.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = VComponentProps<typeof BaseSelect.Trigger>;
interface SelectTriggerProps extends TriggerPrimitiveProps {}

/**
 * Renders the select trigger button. Renders a <button> element.
 */
const Trigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ render = <button />, nativeButton = true, className, ...props }, ref) => {
        const { size, invalid } = useSelectContext();

        return (
            <BaseSelect.Trigger
                ref={ref}
                render={render}
                nativeButton={nativeButton}
                aria-invalid={invalid || undefined}
                className={clsx(styles.trigger({ size, invalid }), className)}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Select.Value
 * -----------------------------------------------------------------------------------------------*/

type ValuePrimitiveProps = VComponentProps<typeof BaseSelect.Value>;
interface SelectValueProps extends ValuePrimitiveProps {}

/**
 * Renders the selected value or placeholder text. Renders a <span> element.
 */
const Value = forwardRef<HTMLSpanElement, SelectValueProps>(
    ({ className, children: childrenProp, ...props }, ref) => {
        const { items, size, placeholder } = useSelectContext();

        const renderValue = (value: string) => {
            if (!items) return value;

            if (Array.isArray(items)) return items.find((item) => item.value === value)?.label;
            return items[value];
        };

        const children = (value: string) =>
            typeof childrenProp === 'function'
                ? childrenProp(value)
                : (childrenProp ?? renderValue(value) ?? <Placeholder>{placeholder}</Placeholder>);

        return (
            <BaseSelect.Value
                ref={ref}
                className={clsx(styles.value({ size }), className)}
                {...props}
            >
                {children}
            </BaseSelect.Value>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Select.Placeholder
 * -----------------------------------------------------------------------------------------------*/

type PlaceholderPrimitiveProps = VComponentProps<'span'>;
interface SelectPlaceholderProps extends PlaceholderPrimitiveProps {}

/**
 * Renders placeholder text when no value is selected. Renders a <span> element.
 */
const Placeholder = forwardRef<HTMLSpanElement, SelectPlaceholderProps>(
    ({ render, className, ...props }, ref) => {
        return (
            <BaseSelect.Value
                ref={ref}
                className={clsx(styles.placeholder, className)}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Select.TriggerIcon
 * -----------------------------------------------------------------------------------------------*/

type TriggerIconPrimitiveProps = VComponentProps<typeof BaseSelect.Icon>;
interface SelectTriggerIconProps extends TriggerIconPrimitiveProps {}

/**
 * Renders the dropdown arrow icon in the trigger. Renders a <div> element.
 */
const TriggerIcon = forwardRef<HTMLDivElement, SelectTriggerIconProps>(
    ({ className, children, ...props }, ref) => {
        const { size } = useSelectContext();

        const IconElement = createSlot(children || <ChevronDownOutlineIcon size="100%" />);

        return (
            <BaseSelect.Icon
                ref={ref}
                className={clsx(styles.triggerIcon({ size }), className)}
                {...props}
            >
                <IconElement />
            </BaseSelect.Icon>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Select.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = VComponentProps<typeof BaseSelect.Portal>;
interface SelectPortalProps extends PortalPrimitiveProps {}

/**
 * Renders select content in a portal outside the normal DOM tree.
 */
const Portal = (props: SelectPortalProps) => {
    return <BaseSelect.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Select.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = VComponentProps<typeof BaseSelect.Positioner>;
interface SelectPositionerProps extends PositionerPrimitiveProps {}

/**
 * Positions the select dropdown relative to the trigger. Renders a <div> element.
 */
const Positioner = forwardRef<HTMLDivElement, SelectPositionerProps>((props, ref) => {
    const {
        side = 'bottom',
        align = 'start',
        sideOffset = 4,
        alignItemWithTrigger = false,
        className,
        ...componentProps
    } = props;

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

/* -------------------------------------------------------------------------------------------------
 * Select.Popup
 * -----------------------------------------------------------------------------------------------*/

type PopupPrimitiveProps = VComponentProps<typeof BaseSelect.Popup>;
interface SelectPopupProps extends PopupPrimitiveProps {}

/**
 * Renders the select dropdown content container. Renders a <div> element.
 */
const Popup = forwardRef<HTMLDivElement, SelectPopupProps>(({ className, ...props }, ref) => {
    return <BaseSelect.Popup ref={ref} className={clsx(styles.popup, className)} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Select.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = VComponentProps<typeof Popup>;
interface SelectContentProps extends ContentPrimitiveProps {
    portalProps?: SelectPortalProps;
    positionerProps?: SelectPositionerProps;
}

/**
 * Combines Portal, Positioner, and Popup components for easy select dropdown rendering. Renders a <div> element.
 */
const Content = forwardRef<HTMLDivElement, SelectContentProps>(
    ({ portalProps, positionerProps, ...props }, ref) => {
        return (
            <Portal {...portalProps}>
                <Positioner {...positionerProps}>
                    <Popup ref={ref} {...props} />
                </Positioner>
            </Portal>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Select.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = VComponentProps<typeof BaseSelect.Item>;
interface SelectItemProps extends ItemPrimitiveProps {}

/**
 * Renders an individual selectable option in the dropdown. Renders a <div> element.
 */
const Item = forwardRef<HTMLDivElement, SelectItemProps>(({ className, ...props }, ref) => {
    return <BaseSelect.Item ref={ref} className={clsx(styles.item, className)} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Select.ItemIndicator
 * -----------------------------------------------------------------------------------------------*/

type ItemIndicatorPrimitiveProps = VComponentProps<typeof BaseSelect.ItemIndicator>;
interface SelectItemIndicatorProps extends ItemIndicatorPrimitiveProps {}

/**
 * Renders the check mark indicator for selected items. Renders a <span> element.
 */
const ItemIndicator = forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
    ({ className, children, ...props }, ref) => {
        const IconElement = createSlot(children || <ConfirmOutlineIcon />);

        return (
            <BaseSelect.ItemIndicator
                ref={ref}
                className={clsx(styles.itemIndicator, className)}
                {...props}
            >
                <IconElement />
            </BaseSelect.ItemIndicator>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Select.Group
 * -----------------------------------------------------------------------------------------------*/

type GroupPrimitiveProps = VComponentProps<typeof BaseSelect.Group>;
interface SelectGroupProps extends GroupPrimitiveProps {}

/**
 * Groups related select options together. Renders a <div> element.
 */
const Group = forwardRef<HTMLDivElement, SelectGroupProps>((props, ref) => {
    return <BaseSelect.Group ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Select.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

type GroupLabelPrimitiveProps = VComponentProps<typeof BaseSelect.GroupLabel>;
interface SelectGroupLabelProps extends GroupLabelPrimitiveProps {}

/**
 * Renders a label for a group of select options. Renders a <div> element.
 */
const GroupLabel = forwardRef<HTMLDivElement, SelectGroupLabelProps>(
    ({ className, ...props }, ref) => {
        return (
            <BaseSelect.GroupLabel
                ref={ref}
                className={clsx(styles.groupLabel, className)}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Select.Separator
 * -----------------------------------------------------------------------------------------------*/

type SeparatorPrimitiveProps = VComponentProps<typeof BaseSelect.Separator>;
interface SelectSeparatorProps extends SeparatorPrimitiveProps {}

/**
 * Renders a visual separator between select options or groups. Renders a <div> element.
 */
const Separator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
    ({ className, ...props }, ref) => {
        return (
            <BaseSelect.Separator
                ref={ref}
                className={clsx(styles.separator, className)}
                {...props}
            />
        );
    },
);

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as SelectRoot,
    Trigger as SelectTrigger,
    Value as SelectValue,
    Placeholder as SelectPlaceholder,
    TriggerIcon as SelectTriggerIcon,
    Portal as SelectPortal,
    Positioner as SelectPositioner,
    Popup as SelectPopup,
    Content as SelectContent,
    Item as SelectItem,
    ItemIndicator as SelectItemIndicator,
    Group as SelectGroup,
    GroupLabel as SelectGroupLabel,
    Separator as SelectSeparator,
};
export type {
    SelectRootProps,
    SelectTriggerProps,
    SelectValueProps,
    SelectPlaceholderProps,
    SelectTriggerIconProps,
    SelectPortalProps,
    SelectPositionerProps,
    SelectPopupProps,
    SelectContentProps,
    SelectItemProps,
    SelectItemIndicatorProps,
    SelectGroupProps,
    SelectGroupLabelProps,
    SelectSeparatorProps,
};

export const Select = {
    Root,
    Trigger,
    Value,
    Placeholder,
    TriggerIcon,
    Content,
    Portal,
    Positioner,
    Popup,
    Item,
    ItemIndicator,
    Group,
    GroupLabel,
    Separator,
};
