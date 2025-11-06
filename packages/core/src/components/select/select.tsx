'use client';

import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Select as BaseSelect } from '@base-ui-components/react';
import { ChevronDownOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
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
 * Select.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTrigger.Props>((props, ref) => {
    const {
        render = <button />,
        nativeButton = true,
        className,
        ...componentProps
    } = resolveStyles(props);

    // TODO required 확인
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
});
SelectTrigger.displayName = 'Select.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Select.Value
 * -----------------------------------------------------------------------------------------------*/

export const SelectValue = forwardRef<HTMLSpanElement, SelectValue.Props>((props, ref) => {
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
            : (childrenProp ??
              renderValue(value) ?? <SelectPlaceholder>{placeholder}</SelectPlaceholder>);

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
SelectValue.displayName = 'Select.Value';

/* -------------------------------------------------------------------------------------------------
 * Select.Placeholder
 * -----------------------------------------------------------------------------------------------*/

export const SelectPlaceholder = forwardRef<HTMLSpanElement, SelectPlaceholder.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return (
            <BaseSelect.Value
                ref={ref}
                className={clsx(styles.placeholder, className)}
                {...componentProps}
            />
        );
    },
);
SelectPlaceholder.displayName = 'Select.Placeholder';

/* -------------------------------------------------------------------------------------------------
 * Select.TriggerIcon
 * -----------------------------------------------------------------------------------------------*/

export const SelectTriggerIcon = forwardRef<HTMLDivElement, SelectTriggerIcon.Props>(
    (props, ref) => {
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
    },
);
SelectTriggerIcon.displayName = 'Select.TriggerIcon';

/* -------------------------------------------------------------------------------------------------
 * Select.Portal
 * -----------------------------------------------------------------------------------------------*/

export const SelectPortal = (props: SelectPortal.Props) => {
    return <BaseSelect.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Select.Positioner
 * -----------------------------------------------------------------------------------------------*/

export const SelectPositioner = forwardRef<HTMLDivElement, SelectPositioner.Props>((props, ref) => {
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
SelectPositioner.displayName = 'Select.Positioner';

/* -------------------------------------------------------------------------------------------------
 * Select.Popup
 * -----------------------------------------------------------------------------------------------*/

export const SelectPopup = forwardRef<HTMLDivElement, SelectPopup.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Popup ref={ref} className={clsx(styles.popup, className)} {...componentProps} />
    );
});
SelectPopup.displayName = 'Select.Popup';

/* -------------------------------------------------------------------------------------------------
 * Select.Content
 * -----------------------------------------------------------------------------------------------*/

export const SelectContent = forwardRef<HTMLDivElement, SelectContent.Props>(
    ({ portalProps, positionerProps, ...props }, ref) => {
        return (
            <SelectPortal {...portalProps}>
                <SelectPositioner {...positionerProps}>
                    <SelectPopup ref={ref} {...props} />
                </SelectPositioner>
            </SelectPortal>
        );
    },
);
SelectContent.displayName = 'Select.Content';

/* -------------------------------------------------------------------------------------------------
 * Select.Item
 * -----------------------------------------------------------------------------------------------*/

export const SelectItem = forwardRef<HTMLDivElement, SelectItem.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseSelect.Item ref={ref} className={clsx(styles.item, className)} {...componentProps} />
    );
});
SelectItem.displayName = 'Select.Item';

/* -------------------------------------------------------------------------------------------------
 * Select.ItemIndicator
 * -----------------------------------------------------------------------------------------------*/

export const SelectItemIndicator = forwardRef<HTMLSpanElement, SelectItemIndicator.Props>(
    (props, ref) => {
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
    },
);
SelectItemIndicator.displayName = 'Select.ItemIndicator';

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
}

export namespace SelectTrigger {
    type TriggerPrimitiveProps = VComponentProps<typeof BaseSelect.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace SelectValue {
    type ValuePrimitiveProps = VComponentProps<typeof BaseSelect.Value>;
    export interface Props extends ValuePrimitiveProps {}
}

export namespace SelectPlaceholder {
    type PlaceholderPrimitiveProps = VComponentProps<'span'>;
    export interface Props extends PlaceholderPrimitiveProps {}
}

export namespace SelectTriggerIcon {
    type TriggerIconPrimitiveProps = VComponentProps<typeof BaseSelect.Icon>;
    export interface Props extends TriggerIconPrimitiveProps {}
}

export namespace SelectPortal {
    type PortalPrimitiveProps = VComponentProps<typeof BaseSelect.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace SelectPositioner {
    type PositionerPrimitiveProps = VComponentProps<typeof BaseSelect.Positioner>;
    export interface Props extends PositionerPrimitiveProps {}
}

export namespace SelectPopup {
    type PopupPrimitiveProps = VComponentProps<typeof BaseSelect.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace SelectContent {
    type ContentPrimitiveProps = VComponentProps<typeof SelectPopup>;
    export interface Props extends ContentPrimitiveProps {
        portalProps?: SelectPortal.Props;
        positionerProps?: SelectPositioner.Props;
    }
}

export namespace SelectItem {
    type ItemPrimitiveProps = VComponentProps<typeof BaseSelect.Item>;
    export interface Props extends ItemPrimitiveProps {}
}

export namespace SelectItemIndicator {
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
