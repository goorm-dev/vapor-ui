'use client';

import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Select as BaseSelect } from '@base-ui-components/react';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
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

const Trigger = forwardRef<HTMLButtonElement, SelectTriggerProps>((props, ref) => {
    const {
        render = <button />,
        nativeButton = true,
        className,
        ...componentProps
    } = resolveStyles(props);

    const { size, invalid } = useSelectContext();

    return (
        <BaseSelect.Trigger
            ref={ref}
            render={render}
            nativeButton={nativeButton}
            aria-invalid={invalid || undefined}
            className={clsx(styles.trigger({ size, invalid }), className)}
            {...componentProps}
        />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.Value
 * -----------------------------------------------------------------------------------------------*/

type ValuePrimitiveProps = VComponentProps<typeof BaseSelect.Value>;
interface SelectValueProps extends ValuePrimitiveProps {}

const Value = forwardRef<HTMLSpanElement, SelectValueProps>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
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
            {...componentProps}
        >
            {children}
        </BaseSelect.Value>
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.Placeholder
 * -----------------------------------------------------------------------------------------------*/

type PlaceholderPrimitiveProps = VComponentProps<'span'>;
interface SelectPlaceholderProps extends PlaceholderPrimitiveProps {}

const Placeholder = forwardRef<HTMLSpanElement, SelectPlaceholderProps>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Value
            ref={ref}
            className={clsx(styles.placeholder, className)}
            {...componentProps}
        />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.TriggerIcon
 * -----------------------------------------------------------------------------------------------*/

type TriggerIconPrimitiveProps = VComponentProps<typeof BaseSelect.Icon>;
interface SelectTriggerIconProps extends TriggerIconPrimitiveProps {}

const TriggerIcon = forwardRef<HTMLDivElement, SelectTriggerIconProps>((props, ref) => {
    const { className, children, ...componentProps } = resolveStyles(props);

    const { size } = useSelectContext();

    const IconElement = createSlot(children || <ChevronDownOutlineIcon size="100%" />);

    return (
        <BaseSelect.Icon
            ref={ref}
            className={clsx(styles.triggerIcon({ size }), className)}
            {...componentProps}
        >
            <IconElement />
        </BaseSelect.Icon>
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = VComponentProps<typeof BaseSelect.Portal>;
interface SelectPortalProps extends PortalPrimitiveProps {}

const Portal = (props: SelectPortalProps) => {
    return <BaseSelect.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Select.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = VComponentProps<typeof BaseSelect.Positioner>;
interface SelectPositionerProps extends PositionerPrimitiveProps {}

const Positioner = forwardRef<HTMLDivElement, SelectPositionerProps>((props, ref) => {
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

/* -------------------------------------------------------------------------------------------------
 * Select.Popup
 * -----------------------------------------------------------------------------------------------*/

type PopupPrimitiveProps = VComponentProps<typeof BaseSelect.Popup>;
interface SelectPopupProps extends PopupPrimitiveProps {}

const Popup = forwardRef<HTMLDivElement, SelectPopupProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Popup ref={ref} className={clsx(styles.popup, className)} {...componentProps} />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = VComponentProps<typeof Popup>;
interface SelectContentProps extends ContentPrimitiveProps {
    portalProps?: SelectPortalProps;
    positionerProps?: SelectPositionerProps;
}

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

const Item = forwardRef<HTMLDivElement, SelectItemProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Item ref={ref} className={clsx(styles.item, className)} {...componentProps} />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.ItemIndicator
 * -----------------------------------------------------------------------------------------------*/

type ItemIndicatorPrimitiveProps = VComponentProps<typeof BaseSelect.ItemIndicator>;
interface SelectItemIndicatorProps extends ItemIndicatorPrimitiveProps {}

const ItemIndicator = forwardRef<HTMLSpanElement, SelectItemIndicatorProps>((props, ref) => {
    const { className, children, ...componentProps } = resolveStyles(props);
    const IconElement = createSlot(children || <ConfirmOutlineIcon />);

    return (
        <BaseSelect.ItemIndicator
            ref={ref}
            className={clsx(styles.itemIndicator, className)}
            {...componentProps}
        >
            <IconElement />
        </BaseSelect.ItemIndicator>
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.Group
 * -----------------------------------------------------------------------------------------------*/

type GroupPrimitiveProps = VComponentProps<typeof BaseSelect.Group>;
interface SelectGroupProps extends GroupPrimitiveProps {}

const Group = forwardRef<HTMLDivElement, SelectGroupProps>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseSelect.Group ref={ref} {...componentProps} />;
});

/* -------------------------------------------------------------------------------------------------
 * Select.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

type GroupLabelPrimitiveProps = VComponentProps<typeof BaseSelect.GroupLabel>;
interface SelectGroupLabelProps extends GroupLabelPrimitiveProps {}

const GroupLabel = forwardRef<HTMLDivElement, SelectGroupLabelProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.GroupLabel
            ref={ref}
            className={clsx(styles.groupLabel, className)}
            {...componentProps}
        />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.Separator
 * -----------------------------------------------------------------------------------------------*/

type SeparatorPrimitiveProps = VComponentProps<typeof BaseSelect.Separator>;
interface SelectSeparatorProps extends SeparatorPrimitiveProps {}

const Separator = forwardRef<HTMLDivElement, SelectSeparatorProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Separator
            ref={ref}
            className={clsx(styles.separator, className)}
            {...componentProps}
        />
    );
});

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
