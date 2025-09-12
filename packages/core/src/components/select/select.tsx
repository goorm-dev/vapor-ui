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
type SelectSharedProps = SelectVariants & Pick<RootPrimitiveProps, 'items'>;

type SelectContext = SelectSharedProps;

const [SelectProvider, useSelectContext] = createContext<SelectContext>({
    name: 'SelectContext',
    providerName: 'SelectProvider',
    hookName: 'useSelectContext',
});

/* -------------------------------------------------------------------------------------------------
 * Select.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = Omit<VComponentProps<typeof BaseSelect.Root>, 'multiple'>;
interface SelectRootProps extends RootPrimitiveProps, SelectVariants {}

const Root = ({ items, ...props }: SelectRootProps) => {
    const [sharedProps, otherProps] = createSplitProps<SelectVariants>()(props, [
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

const Value = forwardRef<HTMLSpanElement, SelectValueProps>(({ ...props }, ref) => {
    return <BaseSelect.Value ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Select.DisplayValue
 * -----------------------------------------------------------------------------------------------*/

type DisplayValuePrimitiveProps = VComponentProps<typeof BaseSelect.Value>;
interface SelectDisplayValueProps extends DisplayValuePrimitiveProps {
    placeholder?: ReactNode;
}

const DisplayValue = forwardRef<HTMLSpanElement, SelectDisplayValueProps>(
    ({ placeholder, className, children: childrenProp, ...props }, ref) => {
        const { items } = useSelectContext();

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
            <BaseSelect.Value ref={ref} className={clsx(styles.value, className)} {...props}>
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

const TriggerIcon = forwardRef<HTMLDivElement, SelectTriggerIconProps>(
    ({ className, children, ...props }, ref) => {
        const IconElement = createSlot(children || <ChevronDownOutlineIcon />);

        return (
            <BaseSelect.Icon ref={ref} className={clsx(styles.icon, className)} {...props}>
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

const Portal = (props: SelectPortalProps) => {
    return <BaseSelect.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Select.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = VComponentProps<typeof BaseSelect.Positioner>;
interface SelectPositionerProps extends PositionerPrimitiveProps {}

const Positioner = forwardRef<HTMLDivElement, SelectPositionerProps>(
    ({ side = 'bottom', align = 'start', sideOffset = 4, ...props }, ref) => {
        return (
            <BaseSelect.Positioner
                ref={ref}
                side={side}
                align={align}
                sideOffset={sideOffset}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Select.Popup
 * -----------------------------------------------------------------------------------------------*/

type PopupPrimitiveProps = VComponentProps<typeof BaseSelect.Popup>;
interface SelectPopupProps extends PopupPrimitiveProps {}

const Popup = forwardRef<HTMLDivElement, SelectPopupProps>(({ className, ...props }, ref) => {
    return <BaseSelect.Popup ref={ref} className={clsx(styles.popup, className)} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Select.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = VComponentProps<typeof Popup>;
interface SelectContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, SelectContentProps>((props, ref) => {
    return (
        <Portal>
            <Positioner>
                <Popup ref={ref} {...props} />
            </Positioner>
        </Portal>
    );
});

/* -------------------------------------------------------------------------------------------------
 * Select.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = VComponentProps<typeof BaseSelect.Item>;
interface SelectItemProps extends ItemPrimitiveProps {}

const Item = forwardRef<HTMLDivElement, SelectItemProps>(({ className, ...props }, ref) => {
    return <BaseSelect.Item ref={ref} className={clsx(styles.item, className)} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Select.ItemIndicator
 * -----------------------------------------------------------------------------------------------*/

type ItemIndicatorPrimitiveProps = VComponentProps<typeof BaseSelect.ItemIndicator>;
interface SelectItemIndicatorProps extends ItemIndicatorPrimitiveProps {}

const ItemIndicator = forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
    ({ className, children, ...props }, ref) => {
        const IconElement = createSlot(children || <ConfirmOutlineIcon />);

        return (
            <BaseSelect.ItemIndicator ref={ref} className={clsx(styles.icon, className)} {...props}>
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

const Group = forwardRef<HTMLDivElement, SelectGroupProps>((props, ref) => {
    return <BaseSelect.Group ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Select.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

type GroupLabelPrimitiveProps = VComponentProps<typeof BaseSelect.GroupLabel>;
interface SelectGroupLabelProps extends GroupLabelPrimitiveProps {}

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
    DisplayValue as SelectDisplayValue,
    Placeholder as SelectPlaceholder,
    TriggerIcon as SelectTriggerIcon,
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
    SelectDisplayValueProps,
    SelectPlaceholderProps,
    SelectTriggerIconProps,
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
    DisplayValue,
    Placeholder,
    TriggerIcon,
    Content,
    Item,
    ItemIndicator,
    Group,
    GroupLabel,
    Separator,
};
