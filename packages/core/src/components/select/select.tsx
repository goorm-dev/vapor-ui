'use client';

import type { ReactElement, ReactNode } from 'react';
import { forwardRef } from 'react';

import { Select as BaseSelect } from '@base-ui-components/react';
import type { IconProps } from '@vapor-ui/icons';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
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

export const SelectTriggerIconPrimitive = forwardRef<
    HTMLDivElement,
    SelectTriggerIconPrimitive.Props
>((props, ref) => {
    const { className, children, ...componentProps } = resolveStyles(props);

    const { size } = useSelectContext();

    const IconElement = useRenderElement<IconProps>(children, <ChevronDownOutlineIcon />);

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

export const SelectPortalPrimitive = (props: SelectPortalPrimitive.Props) => {
    return <BaseSelect.Portal {...props} />;
};

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
        const PortalElement = useRenderElement(portalElement, <SelectPortalPrimitive />);
        const PositionerElement = useRenderElement(
            positionerElement,
            <SelectPositionerPrimitive />,
        );

        return (
            <PortalElement>
                <PositionerElement>
                    <SelectPopupPrimitive ref={ref} {...props} />
                </PositionerElement>
            </PortalElement>
        );
    },
);
SelectPopup.displayName = 'Select.Popup';

/* -------------------------------------------------------------------------------------------------
 * Select.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

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

export const SelectItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    SelectItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children, ...componentProps } = resolveStyles(props);
    const IconElement = useRenderElement<IconProps>(children, <ConfirmOutlineIcon />);

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
SelectItemIndicatorPrimitive.displayName = 'Select.ItemIndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Select.Item
 * -----------------------------------------------------------------------------------------------*/

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
