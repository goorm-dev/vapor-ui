'use client';

import type { ReactElement } from 'react';
import { forwardRef, useMemo } from 'react';

import { Select as BaseSelect } from '@base-ui/react/select';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
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
    /**
     * Text shown in the trigger when no value is selected. The `children` of `MultiSelect.ValuePrimitive`, or the label of an item whose value is `null` in `items`, takes precedence over it.
     */
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

/**
 * Root of the MultiSelect compound component, which lets the user pick several options from a list in a popup. Manages the selected values and open state, and passes `size`, `invalid`, and `placeholder` to its parts. Doesn't render its own HTML element.
 */
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

/**
 * Button that opens the popup when clicked. Renders a `<button>` element.
 */
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
            className={cn(styles.trigger({ size, invalid }), className)}
            {...dataAttrs}
            {...componentProps}
        />
    );
});
MultiSelectTriggerPrimitive.displayName = 'MultiSelect.TriggerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.ValuePrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Shows the selected values inside the trigger as badges, using each item's label from `items`, or the placeholder when nothing is selected. Renders a `<span>` element.
 */
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
            className={cn(styles.value({ size }), className)}
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
 * Placeholder text shown in the trigger when nothing is selected. Renders a `<span>` element.
 *
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
            className={cn(styles.placeholder({ size }), className)}
            {...componentProps}
        />
    );
});
MultiSelectPlaceholderPrimitive.displayName = 'MultiSelect.PlaceholderPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.TriggerIconPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Chevron icon in the trigger that shows the popup can be opened. Renders a `<span>` element.
 */
export const MultiSelectTriggerIconPrimitive = forwardRef<
    HTMLSpanElement,
    MultiSelectTriggerIconPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size } = useMultiSelectContext();

    const childrenRender = createRender(childrenProp, <ChevronDownOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: { width: '100%', height: '100%' },
    });

    return (
        <BaseSelect.Icon
            ref={ref}
            className={cn(styles.triggerIcon({ size }), className)}
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

/**
 * Combines `MultiSelect.TriggerPrimitive`, `MultiSelect.ValuePrimitive`, and `MultiSelect.TriggerIconPrimitive` into a single part that shows the selected values and a chevron icon. Renders a `<button>` element.
 */
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

/**
 * Portal container that renders the popup outside the normal DOM hierarchy. Renders a `<div>` element.
 */
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

/**
 * Positions the popup against its trigger and keeps it inside the viewport. Renders a `<div>` element.
 */
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
            className={cn(styles.positioner, className)}
            {...componentProps}
        />
    );
});
MultiSelectPositionerPrimitive.displayName = 'MultiSelect.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The popup panel that holds the options. Renders a `<div>` element.
 */
export const MultiSelectPopupPrimitive = forwardRef<
    HTMLDivElement,
    MultiSelectPopupPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Popup ref={ref} className={cn(styles.popup, className)} {...componentProps} />
    );
});
MultiSelectPopupPrimitive.displayName = 'MultiSelect.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `MultiSelect.PortalPrimitive`, `MultiSelect.PositionerPrimitive`, and `MultiSelect.PopupPrimitive` into a single part. Use `portalElement` or `positionerElement` to replace the portal or positioner. Renders a `<div>` element.
 */
export const MultiSelectPopup = forwardRef<HTMLDivElement, MultiSelectPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <MultiSelectPopupPrimitive ref={ref} {...props} />;

        const positionerRender = createRender(
            positionerElement,
            <MultiSelectPositionerPrimitive />,
        );
        const positioner = useRenderElement({
            render: positionerRender,
            props: { children: popup },
        });

        const portalRender = createRender(portalElement, <MultiSelectPortalPrimitive />);
        const portal = useRenderElement({
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

/**
 * Option in the popup that the user can select or deselect. Renders a `<div>` element.
 */
export const MultiSelectItemPrimitive = forwardRef<HTMLElement, MultiSelectItemPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseSelect.Item ref={ref} className={cn(styles.item, className)} {...componentProps} />
        );
    },
);
MultiSelectItemPrimitive.displayName = 'MultiSelect.ItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.ItemIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Check mark shown while the item is selected. Renders a `<span>` element.
 */
export const MultiSelectItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    MultiSelectItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const childrenRender = createRender(childrenProp, <ConfirmOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: { width: '100%', height: '100%' },
    });

    return (
        <BaseSelect.ItemIndicator
            ref={ref}
            className={cn(styles.itemIndicator, className)}
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

/**
 * Combines `MultiSelect.ItemPrimitive` and `MultiSelect.ItemIndicatorPrimitive` into a single part, with the check mark after the label. Renders a `<div>` element.
 */
export const MultiSelectItem = forwardRef<HTMLElement, MultiSelectItem.Props>((props, ref) => {
    const { children, ...componentProps } = resolveStyles(props);

    return (
        <MultiSelectItemPrimitive ref={ref} {...componentProps}>
            {children}

            <MultiSelectItemIndicatorPrimitive />
        </MultiSelectItemPrimitive>
    );
});
MultiSelectItem.displayName = 'MultiSelect.Item';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Group
 * -----------------------------------------------------------------------------------------------*/

/**
 * Groups related options under a `MultiSelect.GroupLabel`. Renders a `<div>` element.
 */
export const MultiSelectGroup = forwardRef<HTMLDivElement, MultiSelectGroup.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseSelect.Group ref={ref} {...componentProps} />;
});
MultiSelectGroup.displayName = 'MultiSelect.Group';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

/**
 * Label for a group of options, announced to assistive technologies. Renders a `<div>` element.
 */
export const MultiSelectGroupLabel = forwardRef<HTMLDivElement, MultiSelectGroupLabel.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseSelect.GroupLabel
                ref={ref}
                className={cn(styles.groupLabel, className)}
                {...componentProps}
            />
        );
    },
);
MultiSelectGroupLabel.displayName = 'MultiSelect.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * MultiSelect.Separator
 * -----------------------------------------------------------------------------------------------*/

/**
 * Line that visually separates groups of options. Renders a `<div>` element.
 */
export const MultiSelectSeparator = forwardRef<HTMLDivElement, MultiSelectSeparator.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseSelect.Separator
                ref={ref}
                className={cn(styles.separator, className)}
                {...componentProps}
            />
        );
    },
);
MultiSelectSeparator.displayName = 'MultiSelect.Separator';

/* -----------------------------------------------------------------------------------------------*/

export namespace MultiSelectRoot {
    export type State = BaseSelect.Root.State;
    export interface Props<Value = unknown>
        extends Omit<BaseSelect.Root.Props<Value, true>, 'multiple'>, MultiSelectSharedProps {
        /**
         * Parts of the multi-select, such as `MultiSelect.Trigger` and `MultiSelect.Popup`.
         */
        children?: BaseSelect.Root.Props<Value, true>['children'];
    }

    export type Actions = BaseSelect.Root.Actions;
    export type ChangeEventDetails = BaseSelect.Root.ChangeEventDetails;
}

export namespace MultiSelectTriggerPrimitive {
    export type State = BaseSelect.Trigger.State;
    export interface Props extends VaporUIComponentProps<typeof BaseSelect.Trigger, State> {
        /**
         * Content shown inside the trigger, such as `MultiSelect.ValuePrimitive` and `MultiSelect.TriggerIconPrimitive`.
         */
        children?: BaseSelect.Trigger.Props['children'];
    }
}

export namespace MultiSelectTrigger {
    export type State = MultiSelectTriggerPrimitive.State;
    export interface Props extends MultiSelectTriggerPrimitive.Props {
        /**
         * Not rendered: the trigger always shows the selected values and a chevron icon. Use `MultiSelect.TriggerPrimitive` to compose custom content.
         */
        children?: BaseSelect.Trigger.Props['children'];
    }
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
    export interface Props extends VaporUIComponentProps<typeof BaseSelect.Icon, State> {
        /**
         * Icon shown in place of the default chevron icon.
         */
        children?: BaseSelect.Icon.Props['children'];
    }
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
    export interface Props extends VaporUIComponentProps<typeof BaseSelect.Popup, State> {
        /**
         * Options shown in the popup, such as `MultiSelect.Item`, `MultiSelect.Group`, or `MultiSelect.Separator`.
         */
        children?: BaseSelect.Popup.Props['children'];
    }
}

export interface MultiSelectPopupProps extends MultiSelectPopupPrimitive.Props {
    /**
     * Replaces the default `MultiSelect.PortalPrimitive`. Use to change the portal container.
     */
    portalElement?: ReactElement<MultiSelectPortalPrimitive.Props>;
    /**
     * Replaces the default `MultiSelect.PositionerPrimitive`. Use to change the side, alignment, or offset of the popup.
     */
    positionerElement?: ReactElement<MultiSelectPositionerPrimitive.Props>;
}

export namespace MultiSelectPopup {
    export type State = BaseSelect.Popup.State;
    export type Props = MultiSelectPopupProps;
}

export namespace MultiSelectItemPrimitive {
    export type State = BaseSelect.Item.State;
    export interface Props extends VaporUIComponentProps<typeof BaseSelect.Item, State> {
        /**
         * Content shown inside the option, such as its label and `MultiSelect.ItemIndicatorPrimitive`.
         */
        children?: BaseSelect.Item.Props['children'];
    }
}

export namespace MultiSelectItem {
    export type State = MultiSelectItemPrimitive.State;
    export interface Props extends MultiSelectItemPrimitive.Props {
        /**
         * Label of the option, such as its text or an icon with text. The check mark is added after it.
         */
        children?: BaseSelect.Item.Props['children'];
    }
}

export namespace MultiSelectItemIndicatorPrimitive {
    export type State = BaseSelect.ItemIndicator.State;
    export interface Props extends VaporUIComponentProps<typeof BaseSelect.ItemIndicator, State> {
        /**
         * Icon shown in place of the default check icon.
         */
        children?: BaseSelect.ItemIndicator.Props['children'];
    }
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
