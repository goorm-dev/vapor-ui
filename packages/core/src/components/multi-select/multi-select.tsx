'use client';

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

type MultiSelectContext = MultiSelectSharedProps & Pick<BaseSelect.Root.Props<unknown>, 'items'>;

const [MultiSelectProvider, useMultiSelectContext] = createContext<MultiSelectContext>({
    name: 'MultiSelectContext',
    providerName: 'MultiSelectProvider',
    hookName: 'useMultiSelectContext',
});

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Root
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectRoot = <Value,>({ items, ...props }: MultiSelectRoot.Props<Value>) => {
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
MultiSelectRoot.displayName = 'MultiSelect.Root';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectTrigger = forwardRef<HTMLButtonElement, MultiSelectTrigger.Props>(
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
MultiSelectTrigger.displayName = 'MultiSelect.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Select.Value
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectValue = forwardRef<HTMLSpanElement, MultiSelectValue.Props>(
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
                : (childrenProp ?? renderValue(value) ?? (
                      <MultiSelectPlaceholder>{placeholder}</MultiSelectPlaceholder>
                  ));
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
MultiSelectValue.displayName = 'MultiSelect.Value';

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

export const MultiSelectPlaceholder = forwardRef<HTMLSpanElement, MultiSelectPlaceholder.Props>(
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

export const MultiSelectTriggerIcon = forwardRef<HTMLDivElement, MultiSelectTriggerIcon.Props>(
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
MultiSelectTriggerIcon.displayName = 'MultiSelect.TriggerIcon';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Portal
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectPortal = (props: MultiSelectPortal.Props) => {
    return <BaseSelect.Portal {...props} />;
};
MultiSelectPortal.displayName = 'MultiSelect.Portal';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Positioner
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectPositioner = forwardRef<HTMLDivElement, MultiSelectPositioner.Props>(
    (props, ref) => {
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
    },
);
MultiSelectPositioner.displayName = 'MultiSelect.Positioner';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Popup
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectPopup = forwardRef<HTMLDivElement, MultiSelectPopup.Props>(
    ({ className, ...props }, ref) => {
        return <BaseSelect.Popup ref={ref} className={clsx(styles.popup, className)} {...props} />;
    },
);
MultiSelectPopup.displayName = 'MultiSelect.Popup';

/* -------------------------------------------------------------------------------------------------
 * Select.Content
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectContent = forwardRef<HTMLDivElement, MultiSelectContent.Props>(
    ({ portalProps, positionerProps, ...props }, ref) => {
        return (
            <MultiSelectPortal {...portalProps}>
                <MultiSelectPositioner {...positionerProps}>
                    <MultiSelectPopup ref={ref} {...props} />
                </MultiSelectPositioner>
            </MultiSelectPortal>
        );
    },
);
MultiSelectContent.displayName = 'MultiSelect.Content';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Item
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectItem = forwardRef<HTMLDivElement, MultiSelectItem.Props>(
    ({ className, ...props }, ref) => {
        return <BaseSelect.Item ref={ref} className={clsx(styles.item, className)} {...props} />;
    },
);
MultiSelectItem.displayName = 'MultiSelect.Item';

/* -------------------------------------------------------------------------------------------------
 * Select.ItemIndicator
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectItemIndicator = forwardRef<HTMLSpanElement, MultiSelectItemIndicator.Props>(
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
MultiSelectItemIndicator.displayName = 'MultiSelect.ItemIndicator';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Group
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectGroup = forwardRef<HTMLDivElement, MultiSelectGroup.Props>((props, ref) => {
    return <BaseSelect.Group ref={ref} {...props} />;
});
MultiSelectGroup.displayName = 'MultiSelect.Group';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectGroupLabel = forwardRef<HTMLDivElement, MultiSelectGroupLabel.Props>(
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
MultiSelectGroupLabel.displayName = 'MultiSelect.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Separator
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectSeparator = forwardRef<HTMLDivElement, MultiSelectSeparator.Props>(
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
MultiSelectSeparator.displayName = 'MultiSelect.Separator';

/* -----------------------------------------------------------------------------------------------*/

export namespace MultiSelectRoot {
    type RootPrimitiveProps<Value> = VComponentProps<typeof BaseSelect.Root<Value, true>>;
    export interface Props<Value>
        extends Omit<RootPrimitiveProps<Value>, 'multiple'>,
            MultiSelectSharedProps {}
}

export namespace MultiSelectTrigger {
    type TriggerPrimitiveProps = VComponentProps<typeof BaseSelect.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace MultiSelectValue {
    type ValuePrimitiveProps = VComponentProps<typeof BaseSelect.Value>;
    export interface Props extends ValuePrimitiveProps {}
}

export namespace MultiSelectPlaceholder {
    type PlaceholderPrimitiveProps = VComponentProps<'span'>;
    export interface Props extends PlaceholderPrimitiveProps {}
}

export namespace MultiSelectTriggerIcon {
    type TriggerIconPrimitiveProps = VComponentProps<typeof BaseSelect.Icon>;
    export interface Props extends TriggerIconPrimitiveProps {}
}

export namespace MultiSelectPortal {
    type PortalPrimitiveProps = VComponentProps<typeof BaseSelect.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace MultiSelectPositioner {
    type PositionerPrimitiveProps = VComponentProps<typeof BaseSelect.Positioner>;
    export interface Props extends PositionerPrimitiveProps {}
}

export namespace MultiSelectPopup {
    type PopupPrimitiveProps = VComponentProps<typeof BaseSelect.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace MultiSelectContent {
    type ContentPrimitiveProps = VComponentProps<typeof MultiSelectPopup>;
    export interface Props extends ContentPrimitiveProps {
        portalProps?: MultiSelectPortal.Props;
        positionerProps?: MultiSelectPositioner.Props;
    }
}

export namespace MultiSelectItem {
    type ItemPrimitiveProps = VComponentProps<typeof BaseSelect.Item>;
    export interface Props extends ItemPrimitiveProps {}
}

export namespace MultiSelectItemIndicator {
    type ItemIndicatorPrimitiveProps = VComponentProps<typeof BaseSelect.ItemIndicator>;
    export interface Props extends ItemIndicatorPrimitiveProps {}
}

export namespace MultiSelectGroup {
    type GroupPrimitiveProps = VComponentProps<typeof BaseSelect.Group>;
    export interface Props extends GroupPrimitiveProps {}
}

export namespace MultiSelectGroupLabel {
    type GroupLabelPrimitiveProps = VComponentProps<typeof BaseSelect.GroupLabel>;
    export interface Props extends GroupLabelPrimitiveProps {}
}

export namespace MultiSelectSeparator {
    type SeparatorPrimitiveProps = VComponentProps<typeof BaseSelect.Separator>;
    export interface Props extends SeparatorPrimitiveProps {}
}
