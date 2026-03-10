'use client';

import type { ReactElement, ReactNode } from 'react';
import { forwardRef } from 'react';

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

import * as styles from './select.css';
import type { TriggerVariants } from './select.css';

const [SelectProvider, useSelectContext] = createContext<SelectContext>({
    name: 'SelectContext',
    providerName: 'SelectProvider',
    hookName: 'useSelectContext',
});

/* -------------------------------------------------------------------------------------------------
 * Select.Root
 * -----------------------------------------------------------------------------------------------*/

export const SelectRoot = <Value,>(props: SelectRoot.Props<Value>) => {
    const [contextProps, otherProps] = createSplitProps<SelectContext>()(props, [
        'placeholder',
        'size',
        'invalid',
        'items',
        'required',
    ]);

    const { items, required } = contextProps;

    return (
        <SelectProvider value={contextProps}>
            <BaseSelect.Root items={items} required={required} {...otherProps} multiple={false} />
        </SelectProvider>
    );
};
SelectRoot.displayName = 'Select.Root';

/* -------------------------------------------------------------------------------------------------
 * Select.TriggerPrimitive
 * -----------------------------------------------------------------------------------------------*/

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
                : (childrenProp ?? renderValue(value) ?? placeholder);

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
 * @deprecated The `Select.PlaceholderPrimitive` component is deprecated and will be removed in a future release. Please use the `placeholder` prop on `Select.Root` instead and `data-placeholder` attribute for styling.
 */
export const SelectPlaceholderPrimitive = forwardRef<
    HTMLSpanElement,
    SelectPlaceholderPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

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

export const SelectTriggerIconPrimitive = forwardRef<
    HTMLSpanElement,
    SelectTriggerIconPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size } = useSelectContext();

    const childrenRender = createRender(childrenProp, <ChevronDownOutlineIcon />);
    const children = useRender({
        render: childrenRender,
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

export const SelectPortalPrimitive = forwardRef<HTMLDivElement, SelectPortalPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BaseSelect.Portal ref={ref} {...componentProps} />;
    },
);
SelectPortalPrimitive.displayName = 'Select.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

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

export const SelectPopup = forwardRef<HTMLDivElement, SelectPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <SelectPopupPrimitive ref={ref} {...props} />;

        const positionerRender = createRender(positionerElement, <SelectPositionerPrimitive />);
        const positioner = useRender({
            render: positionerRender,
            props: { children: popup },
        });

        const portalRender = createRender(portalElement, <SelectPortalPrimitive />);
        const portal = useRender({
            render: portalRender,
            props: { children: positioner },
        });

        return portal;
    },
);
SelectPopup.displayName = 'Select.Popup';

/* -------------------------------------------------------------------------------------------------
 * Select.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const SelectItemPrimitive = forwardRef<HTMLElement, SelectItemPrimitive.Props>(
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

export const SelectItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    SelectItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const childrenRender = createRender(childrenProp, <ConfirmOutlineIcon />);
    const children = useRender({
        render: childrenRender,
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

export const SelectItem = forwardRef<HTMLElement, SelectItem.Props>((props, ref) => {
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

export const SelectGroup = forwardRef<HTMLDivElement, SelectGroup.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseSelect.Group ref={ref} {...componentProps} />;
});
SelectGroup.displayName = 'Select.Group';

/* -------------------------------------------------------------------------------------------------
 * Select.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

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

type SelectVariants = TriggerVariants;
type SelectContext = Pick<SelectRoot.Props<unknown>, 'items' | 'required' | 'placeholder'> &
    SelectVariants;

interface SelectRootProps<Value = unknown>
    extends SelectVariants, Omit<BaseSelect.Root.Props<Value, false>, 'multiple'> {
    /**
     * The placeholder value to display when no value is selected.
     * This is overridden by `children` of Select.Value if specified, or by a null item's label in `items`.
     */
    placeholder?: ReactNode;
}

export namespace SelectRoot {
    export type State = BaseSelect.Root.State;
    export type Props<Value = unknown> = SelectRootProps<Value>;

    export type Actions = BaseSelect.Root.Actions;
    export type ChangeEventDetails = BaseSelect.Root.ChangeEventDetails;
}

export namespace SelectTriggerPrimitive {
    export type State = BaseSelect.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Trigger, State>;
}

export namespace SelectTrigger {
    export type State = SelectTriggerPrimitive.State;
    export type Props = SelectTriggerPrimitive.Props;
}

export namespace SelectValuePrimitive {
    export type State = BaseSelect.Value.State;
    export type Props = Omit<VaporUIComponentProps<typeof BaseSelect.Value, State>, 'placeholder'>;
}

export namespace SelectPlaceholderPrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}

export namespace SelectTriggerIconPrimitive {
    export type State = BaseSelect.Icon.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Icon, State>;
}

export namespace SelectPortalPrimitive {
    export type State = BaseSelect.Portal.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Portal, State>;
}

export namespace SelectPositionerPrimitive {
    export type State = BaseSelect.Positioner.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Positioner, State>;
}

export namespace SelectPopupPrimitive {
    export type State = BaseSelect.Popup.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Popup, State>;
}

interface SelectPopupProps extends SelectPopupPrimitive.Props {
    /**
     * A Custom element for Select.PortalPrimitive. If not provided, the default Select.PortalPrimitive will be rendered.
     */
    portalElement?: ReactElement<SelectPortalPrimitive.Props>;
    /**
     * A Custom element for Select.PositionerPrimitive. If not provided, the default Select.PositionerPrimitive will be rendered.
     */
    positionerElement?: ReactElement<SelectPositionerPrimitive.Props>;
}

export namespace SelectPopup {
    export type State = SelectPopupPrimitive.State;
    export type Props = SelectPopupProps;
}

export namespace SelectItemPrimitive {
    export type State = BaseSelect.Item.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Item, State>;
}

export namespace SelectItem {
    export type State = SelectItemPrimitive.State;
    export type Props = SelectItemPrimitive.Props;
}

export namespace SelectItemIndicatorPrimitive {
    export type State = BaseSelect.ItemIndicator.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.ItemIndicator, State>;
}

export namespace SelectGroup {
    export type State = BaseSelect.Group.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Group, State>;
}

export namespace SelectGroupLabel {
    export type State = BaseSelect.GroupLabel.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.GroupLabel, State>;
}

export namespace SelectSeparator {
    export type State = BaseSelect.Separator.State;
    export type Props = VaporUIComponentProps<typeof BaseSelect.Separator, State>;
}
