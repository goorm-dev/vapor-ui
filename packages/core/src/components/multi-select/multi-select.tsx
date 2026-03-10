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
import type { VaporUIComponentProps } from '~/utils/types';

import { Badge } from '../badge';
import type { TriggerVariants } from './multi-select.css';
import * as styles from './multi-select.css';

type MultiSelectVariants = TriggerVariants;
type MultiSelectSharedProps = MultiSelectVariants & {
    placeholder?: React.ReactNode;
};

type MultiSelectContext = MultiSelectSharedProps &
    Pick<MultiSelectRoot.Props<unknown>, 'items' | 'required'>;

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
            : (childrenProp ?? renderValue(value) ?? placeholder);
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

/**
 * @deprecated The `MultiSelect.PlaceholderPrimitive` component is deprecated and will be removed in a future release. Please use the `placeholder` prop on `MultiSelect.Root` instead and `data-placeholder` attribute for styling.
 */
export const MultiSelectPlaceholderPrimitive = forwardRef<
    HTMLSpanElement,
    MultiSelectPlaceholderPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
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
    HTMLSpanElement,
    MultiSelectTriggerIconPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size } = useMultiSelectContext();

    const childrenRender = createRender(childrenProp, <ChevronDownOutlineIcon />);
    const children = useRender({
        render: childrenRender,
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

export const MultiSelectPortalPrimitive = forwardRef<
    HTMLDivElement,
    MultiSelectPortalPrimitive.Props
>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseSelect.Portal ref={ref} {...componentProps} />;
});
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

        const positionerRender = createRender(
            positionerElement,
            <MultiSelectPositionerPrimitive />,
        );
        const positioner = useRender({
            render: positionerRender,
            props: { children: popup },
        });

        const portalRender = createRender(portalElement, <MultiSelectPortalPrimitive />);
        const portal = useRender({
            render: portalRender,
            props: { children: positioner },
        });

        return portal;
    },
);
MultiSelectPopup.displayName = 'MultiSelect.Popup';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MultiSelectItemPrimitive = forwardRef<HTMLElement, MultiSelectItemPrimitive.Props>(
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

    const childrenRender = createRender(childrenProp, <ConfirmOutlineIcon />);
    const children = useRender({
        render: childrenRender,
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

export const MultiSelectItem = forwardRef<HTMLElement, MultiSelectItemPrimitive.Props>(
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
    export type State = BaseSelect.Root.State;
    export type Props<Value = unknown> = Omit<BaseSelect.Root.Props<Value, true>, 'multiple'> &
        MultiSelectSharedProps;

    export type Actions = BaseSelect.Root.Actions;
    export type ChangeEventDetails = BaseSelect.Root.ChangeEventDetails;
}

export namespace MultiSelectTriggerPrimitive {
    export type State = BaseSelect.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Trigger, State>;
}

export namespace MultiSelectTrigger {
    export type State = MultiSelectTriggerPrimitive.State;
    export type Props = MultiSelectTriggerPrimitive.Props;
}

export namespace MultiSelectValuePrimitive {
    export type State = BaseSelect.Value.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Value, State>;
}

export namespace MultiSelectPlaceholderPrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}

export namespace MultiSelectTriggerIconPrimitive {
    export type State = BaseSelect.Icon.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Icon, State>;
}

export namespace MultiSelectPortalPrimitive {
    export type State = BaseSelect.Portal.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Portal, State>;
}

export namespace MultiSelectPositionerPrimitive {
    export type State = BaseSelect.Positioner.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Positioner, State>;
}

export namespace MultiSelectPopupPrimitive {
    export type State = BaseSelect.Popup.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Popup, State>;
}

export interface MultiSelectPopupProps extends MultiSelectPopupPrimitive.Props {
    /**
     * A Custom element for MultiSelect.PortalPrimitive. If not provided, the default MultiSelect.PortalPrimitive will be rendered.
     */
    portalElement?: ReactElement<MultiSelectPortalPrimitive.Props>;
    /**
     * A Custom element for MultiSelect.PositionerPrimitive. If not provided, the default MultiSelect.PositionerPrimitive will be rendered.
     */
    positionerElement?: ReactElement<MultiSelectPositionerPrimitive.Props>;
}

export namespace MultiSelectPopup {
    export type State = BaseSelect.Popup.State;
    export type Props = MultiSelectPopupProps;
}

export namespace MultiSelectItemPrimitive {
    export type State = BaseSelect.Item.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Item, State>;
}

export namespace MultiSelectItem {
    export type State = MultiSelectItemPrimitive.State;
    export type Props = MultiSelectItemPrimitive.Props;
}

export namespace MultiSelectItemIndicatorPrimitive {
    export type State = BaseSelect.ItemIndicator.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.ItemIndicator, State>;
}

export namespace MultiSelectGroup {
    export type State = BaseSelect.Group.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Group, State>;
}

export namespace MultiSelectGroupLabel {
    export type State = BaseSelect.GroupLabel.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.GroupLabel, State>;
}

export namespace MultiSelectSeparator {
    export type State = BaseSelect.Separator.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Separator, State>;
}
