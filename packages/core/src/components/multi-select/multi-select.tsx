'use client';

import type { ReactElement } from 'react';
import { forwardRef, useMemo } from 'react';

import { Select as BaseSelect } from '@base-ui/react/select';
import { useRender } from '@base-ui/react/use-render';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { Badge } from '../badge';
import type { TriggerVariants } from './multi-select.css';
import * as styles from './multi-select.css';

type MultiSelectVariants = TriggerVariants;
type MultiSelectSharedProps = MultiSelectVariants & {
    placeholder?: React.ReactNode;
};

type MultiSelectContext = MultiSelectSharedProps &
    Pick<BaseSelect.Root.Props<unknown>, 'items' | 'required'>;

const [MultiSelectProvider, useMultiSelectContext] = createContext<MultiSelectContext>({
    name: 'MultiSelectContext',
    providerName: 'MultiSelectProvider',
    hookName: 'useMultiSelectContext',
});

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Root
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectRoot = <Value,>(props: MultiSelectRoot.Props<Value>) => {
    const [sharedProps, otherProps] = createSplitProps<MultiSelectSharedProps>()(props, [
        'placeholder',
        'size',
        'invalid',
    ]);

    const { items, required } = otherProps;

    return (
        <MultiSelectProvider value={{ items, required, ...sharedProps }}>
            <BaseSelect.Root {...otherProps} multiple />
        </MultiSelectProvider>
    );
};
MultiSelectRoot.displayName = 'MultiSelect.Root';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.TriggerPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectTriggerPrimitive = forwardRef<
    HTMLButtonElement,
    MultiSelectTriggerPrimitive.Props
>((props, ref) => {
    const {
        render = <button />,
        nativeButton = true,
        className,
        ...componentProps
    } = resolveStyles(props);

    const { size, required, invalid } = useMultiSelectContext();
    const dataAttrs = createDataAttributes({ required, invalid });

    return (
        <BaseSelect.Trigger
            ref={ref}
            render={render}
            nativeButton={nativeButton}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            className={clsx(styles.trigger({ size, invalid }), className)}
            {...dataAttrs}
            {...componentProps}
        />
    );
});
MultiSelectTriggerPrimitive.displayName = 'MultiSelect.TriggerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.ValuePrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectValuePrimitive = forwardRef<
    HTMLSpanElement,
    MultiSelectValuePrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
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
                  <MultiSelectPlaceholderPrimitive>{placeholder}</MultiSelectPlaceholderPrimitive>
              ));
    };

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
MultiSelectValuePrimitive.displayName = 'MultiSelect.ValuePrimitive';

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
 * Select.PlaceholderPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectPlaceholderPrimitive = forwardRef<
    HTMLSpanElement,
    MultiSelectPlaceholderPrimitive.Props
>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const { size } = useMultiSelectContext();

    return (
        <BaseSelect.Value
            ref={ref}
            className={clsx(styles.placeholder({ size }), className)}
            {...componentProps}
        />
    );
});
MultiSelectPlaceholderPrimitive.displayName = 'MultiSelect.PlaceholderPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.TriggerIconPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectTriggerIconPrimitive = forwardRef<
    HTMLDivElement,
    MultiSelectTriggerIconPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size } = useMultiSelectContext();

    const children = useRender({
        render: createRender(childrenProp, <ChevronDownOutlineIcon />),
        props: { width: '100%', height: '100%' },
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
MultiSelectTriggerIconPrimitive.displayName = 'MultiSelect.TriggerIconPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectTrigger = forwardRef<HTMLButtonElement, MultiSelectTrigger.Props>(
    (props, ref) => {
        return (
            <MultiSelectTriggerPrimitive ref={ref} {...props}>
                <MultiSelectValuePrimitive />
                <MultiSelectTriggerIconPrimitive />
            </MultiSelectTriggerPrimitive>
        );
    },
);
MultiSelectTrigger.displayName = 'MultiSelect.Trigger';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectPortalPrimitive = (props: MultiSelectPortalPrimitive.Props) => {
    return <BaseSelect.Portal {...props} />;
};
MultiSelectPortalPrimitive.displayName = 'MultiSelect.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectPositionerPrimitive = forwardRef<
    HTMLDivElement,
    MultiSelectPositionerPrimitive.Props
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
MultiSelectPositionerPrimitive.displayName = 'MultiSelect.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectPopupPrimitive = forwardRef<
    HTMLDivElement,
    MultiSelectPopupPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Popup ref={ref} className={clsx(styles.popup, className)} {...componentProps} />
    );
});
MultiSelectPopupPrimitive.displayName = 'MultiSelect.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.Popup
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectPopup = forwardRef<HTMLDivElement, MultiSelectPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <MultiSelectPopupPrimitive ref={ref} {...props} />;

        const positioner = useRender({
            render: createRender(positionerElement, <MultiSelectPositionerPrimitive />),
            props: { children: popup },
        });

        const portal = useRender({
            render: createRender(portalElement, <MultiSelectPortalPrimitive />),
            props: { children: positioner },
        });

        return portal;
    },
);
MultiSelectPopup.displayName = 'MultiSelect.Popup';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectItemPrimitive = forwardRef<HTMLDivElement, MultiSelectItemPrimitive.Props>(
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
MultiSelectItemPrimitive.displayName = 'MultiSelect.ItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.ItemIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    MultiSelectItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const children = useRender({
        render: createRender(childrenProp, <ConfirmOutlineIcon />),
        props: { width: '100%', height: '100%' },
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
MultiSelectItemIndicatorPrimitive.displayName = 'MultiSelect.ItemIndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Item
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectItem = forwardRef<HTMLDivElement, MultiSelectItemPrimitive.Props>(
    (props, ref) => {
        const { children, ...componentProps } = resolveStyles(props);

        return (
            <MultiSelectItemPrimitive ref={ref} {...componentProps}>
                {children}

                <MultiSelectItemIndicatorPrimitive />
            </MultiSelectItemPrimitive>
        );
    },
);
MultiSelectItem.displayName = 'MultiSelect.Item';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Group
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectGroup = forwardRef<HTMLDivElement, MultiSelectGroup.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseSelect.Group ref={ref} {...componentProps} />;
});
MultiSelectGroup.displayName = 'MultiSelect.Group';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectGroupLabel = forwardRef<HTMLDivElement, MultiSelectGroupLabel.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseSelect.GroupLabel
                ref={ref}
                className={clsx(styles.groupLabel, className)}
                {...componentProps}
            />
        );
    },
);
MultiSelectGroupLabel.displayName = 'MultiSelect.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Separator
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectSeparator = forwardRef<HTMLDivElement, MultiSelectSeparator.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseSelect.Separator
                ref={ref}
                className={clsx(styles.separator, className)}
                {...componentProps}
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
    export type ChangeEventDetails = BaseSelect.Root.ChangeEventDetails;
}

export namespace MultiSelectTriggerPrimitive {
    type TriggerPrimitiveProps = VComponentProps<typeof BaseSelect.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace MultiSelectTrigger {
    export interface Props extends MultiSelectTriggerPrimitive.Props {}
}

export namespace MultiSelectValuePrimitive {
    type ValuePrimitiveProps = VComponentProps<typeof BaseSelect.Value>;
    export interface Props extends ValuePrimitiveProps {}
}

export namespace MultiSelectPlaceholderPrimitive {
    type PlaceholderPrimitiveProps = VComponentProps<'span'>;
    export interface Props extends PlaceholderPrimitiveProps {}
}

export namespace MultiSelectTriggerIconPrimitive {
    type TriggerIconPrimitiveProps = VComponentProps<typeof BaseSelect.Icon>;
    export interface Props extends TriggerIconPrimitiveProps {}
}

export namespace MultiSelectPortalPrimitive {
    type PortalPrimitiveProps = VComponentProps<typeof BaseSelect.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace MultiSelectPositionerPrimitive {
    type PositionerPrimitiveProps = VComponentProps<typeof BaseSelect.Positioner>;
    export interface Props extends PositionerPrimitiveProps {}
}

export namespace MultiSelectPopupPrimitive {
    type PopupPrimitiveProps = VComponentProps<typeof BaseSelect.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace MultiSelectPopup {
    type PopupPrimitiveProps = VComponentProps<typeof MultiSelectPopupPrimitive>;
    export interface Props extends PopupPrimitiveProps {
        portalElement?: ReactElement<MultiSelectPortalPrimitive.Props>;
        positionerElement?: ReactElement<MultiSelectPositionerPrimitive.Props>;
    }
}

export namespace MultiSelectItemPrimitive {
    type ItemPrimitiveProps = VComponentProps<typeof BaseSelect.Item>;
    export interface Props extends ItemPrimitiveProps {}
}

export namespace MultiSelectItem {
    export interface Props extends MultiSelectItemPrimitive.Props {}
}

export namespace MultiSelectItemIndicatorPrimitive {
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
