import { forwardRef, useMemo } from 'react';

import { Select as BaseSelect } from '@base-ui-components/react';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Badge } from '../badge';
import type { TriggerVariants } from './multi-select.css';
import * as styles from './multi-select.css';

type MultiSelectVariants = TriggerVariants;
type MultiSelectSharedProps = MultiSelectVariants & {
    placeholder?: React.ReactNode;
};

type MultiSelectContext = MultiSelectSharedProps & Pick<RootPrimitiveProps<unknown>, 'items'>;

const [MultiSelectProvider, useMultiSelectContext] = createContext<MultiSelectContext>({
    name: 'MultiSelectContext',
    providerName: 'MultiSelectProvider',
    hookName: 'useMultiSelectContext',
});

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps<Value> = VComponentProps<typeof BaseSelect.Root<Value, true>>;
interface MultiSelectRootProps<Value>
    extends Omit<RootPrimitiveProps<Value>, 'multiple'>,
        MultiSelectSharedProps {}

const Root = <Value,>({ items, ...props }: MultiSelectRootProps<Value>) => {
    const [sharedProps, otherProps] = createSplitProps<MultiSelectSharedProps>()(props, [
        'placeholder',
        'size',
        'invalid',
    ]);

    return (
        <MultiSelectProvider value={{ items, ...sharedProps }}>
            <BaseSelect.Root {...otherProps} multiple />
        </MultiSelectProvider>
    );
};
Root.displayName = 'MultiSelect.Root';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = VComponentProps<typeof BaseSelect.Trigger>;
interface MultiSelectTriggerProps extends TriggerPrimitiveProps {}

const Trigger = forwardRef<HTMLButtonElement, MultiSelectTriggerProps>(
    ({ render = <button />, nativeButton = true, className, ...props }, ref) => {
        const { size, invalid } = useMultiSelectContext();

        return (
            <BaseSelect.Trigger
                ref={ref}
                render={render}
                nativeButton={nativeButton}
                className={clsx(styles.trigger({ size, invalid }), className)}
                {...props}
            />
        );
    },
);
Trigger.displayName = 'MultiSelect.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Select.Value
 * -----------------------------------------------------------------------------------------------*/

type ValuePrimitiveProps = VComponentProps<typeof BaseSelect.Value>;
interface MultiSelectValueProps extends ValuePrimitiveProps {}

const Value = forwardRef<HTMLSpanElement, MultiSelectValueProps>(
    ({ className, children: childrenProp, ...props }, ref) => {
        const { size = 'md', items, placeholder } = useMultiSelectContext();

        const itemMap = useMemo(() => {
            if (Array.isArray(items)) return new Map(items.map((item) => [item.value, item.label]));

            if (typeof items === 'object' && items !== null) return new Map(Object.entries(items));

            return new Map();
        }, [items]);

        const getLabel = (val: string) => itemMap.get(val) ?? val;

        const renderValue = (value: Array<string>) => {
            if (value.length === 0) {
                return itemMap.get(null) ?? itemMap.get('null');
            }

            return value.map((val) => (
                <Badge key={val} size={badgeSizeMap[size]}>
                    {getLabel(val)}
                </Badge>
            ));
        };

        const children = (value: Array<string>) => {
            return typeof childrenProp === 'function'
                ? childrenProp(value)
                : (childrenProp ?? renderValue(value) ?? <Placeholder>{placeholder}</Placeholder>);
        };

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

const badgeSizeMap: Record<
    NonNullable<MultiSelectVariants['size']>,
    NonNullable<React.ComponentProps<typeof Badge>['size']>
> = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
};

/* -------------------------------------------------------------------------------------------------
 * Select.Placeholder
 * -----------------------------------------------------------------------------------------------*/

type PlaceholderPrimitiveProps = VComponentProps<'span'>;
interface MultiSelectPlaceholderProps extends PlaceholderPrimitiveProps {}

const Placeholder = forwardRef<HTMLSpanElement, MultiSelectPlaceholderProps>(
    ({ render, className, ...props }, ref) => {
        const { size } = useMultiSelectContext();

        return (
            <BaseSelect.Value
                ref={ref}
                className={clsx(styles.placeholder({ size }), className)}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.TriggerIcon
 * -----------------------------------------------------------------------------------------------*/

type TriggerIconPrimitiveProps = VComponentProps<typeof BaseSelect.Icon>;
interface MultiSelectTriggerIconProps extends TriggerIconPrimitiveProps {}

const TriggerIcon = forwardRef<HTMLDivElement, MultiSelectTriggerIconProps>(
    ({ className, children, ...props }, ref) => {
        const { size } = useMultiSelectContext();
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

TriggerIcon.displayName = 'MultiSelect.TriggerIcon';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = VComponentProps<typeof BaseSelect.Portal>;
interface MultiSelectPortalProps extends PortalPrimitiveProps {}

const Portal = (props: MultiSelectPortalProps) => {
    return <BaseSelect.Portal {...props} />;
};
Portal.displayName = 'MultiSelect.Portal';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = VComponentProps<typeof BaseSelect.Positioner>;
interface MultiSelectPositionerProps extends PositionerPrimitiveProps {}

const Positioner = forwardRef<HTMLDivElement, MultiSelectPositionerProps>((props, ref) => {
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
Positioner.displayName = 'MultiSelect.Positioner';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Popup
 * -----------------------------------------------------------------------------------------------*/

type PopupPrimitiveProps = VComponentProps<typeof BaseSelect.Popup>;
interface MultiSelectPopupProps extends PopupPrimitiveProps {}

const Popup = forwardRef<HTMLDivElement, MultiSelectPopupProps>(({ className, ...props }, ref) => {
    return <BaseSelect.Popup ref={ref} className={clsx(styles.popup, className)} {...props} />;
});
Popup.displayName = 'MultiSelect.Popup';

/* -------------------------------------------------------------------------------------------------
 * Select.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = VComponentProps<typeof Popup>;
interface MultiSelectContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, MultiSelectContentProps>((props, ref) => {
    return (
        <Portal>
            <Positioner>
                <Popup ref={ref} {...props} />
            </Positioner>
        </Portal>
    );
});
Content.displayName = 'MultiSelect.Content';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = VComponentProps<typeof BaseSelect.Item>;
interface MultiSelectItemProps extends ItemPrimitiveProps {}

const Item = forwardRef<HTMLDivElement, MultiSelectItemProps>(({ className, ...props }, ref) => {
    return <BaseSelect.Item ref={ref} className={clsx(styles.item, className)} {...props} />;
});
Item.displayName = 'MultiSelect.Item';

/* -------------------------------------------------------------------------------------------------
 * Select.ItemIndicator
 * -----------------------------------------------------------------------------------------------*/

type ItemIndicatorPrimitiveProps = VComponentProps<typeof BaseSelect.ItemIndicator>;
interface MultiSelectItemIndicatorProps extends ItemIndicatorPrimitiveProps {}

const ItemIndicator = forwardRef<HTMLSpanElement, MultiSelectItemIndicatorProps>(
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
ItemIndicator.displayName = 'MultiSelect.ItemIndicator';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Group
 * -----------------------------------------------------------------------------------------------*/

type GroupPrimitiveProps = VComponentProps<typeof BaseSelect.Group>;
interface MultiSelectGroupProps extends GroupPrimitiveProps {}

const Group = forwardRef<HTMLDivElement, MultiSelectGroupProps>((props, ref) => {
    return <BaseSelect.Group ref={ref} {...props} />;
});
Group.displayName = 'MultiSelect.Group';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

type GroupLabelPrimitiveProps = VComponentProps<typeof BaseSelect.GroupLabel>;
interface MultiSelectGroupLabelProps extends GroupLabelPrimitiveProps {}

const GroupLabel = forwardRef<HTMLDivElement, MultiSelectGroupLabelProps>(
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
GroupLabel.displayName = 'MultiSelect.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Separator
 * -----------------------------------------------------------------------------------------------*/

type SeparatorPrimitiveProps = VComponentProps<typeof BaseSelect.Separator>;
interface MultiSelectSeparatorProps extends SeparatorPrimitiveProps {}

const Separator = forwardRef<HTMLDivElement, MultiSelectSeparatorProps>(
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
Separator.displayName = 'MultiSelect.Separator';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as MultiSelectRoot,
    Trigger as MultiSelectTrigger,
    Value as MultiSelectValue,
    Placeholder as MultiSelectPlaceholder,
    TriggerIcon as MultiSelectTriggerIcon,
    Portal as MultiSelectPortal,
    Positioner as MultiSelectPositioner,
    Popup as MultiSelectPopup,
    Content as MultiSelectContent,
    Item as MultiSelectItem,
    ItemIndicator as MultiSelectItemIndicator,
    Group as MultiSelectGroup,
    GroupLabel as MultiSelectGroupLabel,
    Separator as MultiSelectSeparator,
};

export type {
    MultiSelectRootProps,
    MultiSelectTriggerProps,
    MultiSelectValueProps,
    MultiSelectPlaceholderProps,
    MultiSelectTriggerIconProps,
    MultiSelectPortalProps,
    MultiSelectPositionerProps,
    MultiSelectPopupProps,
    MultiSelectContentProps,
    MultiSelectItemProps,
    MultiSelectItemIndicatorProps,
    MultiSelectGroupProps,
    MultiSelectGroupLabelProps,
    MultiSelectSeparatorProps,
};

export const MultiSelect = {
    Root,
    Trigger,
    Value,
    Placeholder,
    TriggerIcon,
    Portal,
    Positioner,
    Popup,
    Content,
    Item,
    ItemIndicator,
    Group,
    GroupLabel,
    Separator,
};
