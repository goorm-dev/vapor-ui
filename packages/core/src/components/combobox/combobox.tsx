'use client';

import type { ReactNode } from 'react';
import { forwardRef, isValidElement } from 'react';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { ChevronDownOutlineIcon, CloseOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './combobox.css';
import type { InputGroupVariants } from './combobox.css';

const [ComboboxProvider, useComboboxContext] = createContext<ComboboxContext>({
    name: 'ComboboxContext',
    providerName: 'ComboboxProvider',
    hookName: 'useComboboxContext',
});

/**
 * Wraps each item renderer function in a `Collection`, which is what makes Base UI filter the items. Base UI does this itself only when a function is the sole child.
 */
const withCollections = (nodes: unknown[]) =>
    nodes.map((node, index) =>
        typeof node === 'function' ? (
            <BaseCombobox.Collection key={index}>
                {node as ComboboxItemRenderer}
            </BaseCombobox.Collection>
        ) : (
            (node as ReactNode)
        ),
    );

/**
 * Applies the full-size rule only to the default icon, so an icon passed as a child keeps its own size.
 */
const defaultIconProps = (children: ReactNode) =>
    isValidElement(children) ? undefined : { width: '100%', height: '100%' };

/* -------------------------------------------------------------------------------------------------
 * Combobox.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Combobox compound component, which lets the user type to filter a list in a popup and pick one option. Manages the selected value, input text, and open state, and passes `size`, `invalid`, `placeholder`, and the accessible name to its parts. Doesn't render its own HTML element.
 */
export const ComboboxRoot = <Value,>(props: ComboboxRoot.Props<Value>) => {
    const [contextProps, otherProps] = createSplitProps<ComboboxContext>()(props, [
        'size',
        'invalid',
        'placeholder',
        'readOnly',
        'aria-label',
        'aria-labelledby',
    ]);

    return (
        <ComboboxProvider value={contextProps}>
            <BaseCombobox.Root {...otherProps} readOnly={contextProps.readOnly} multiple={false} />
        </ComboboxProvider>
    );
};
ComboboxRoot.displayName = 'Combobox.Root';

/* -------------------------------------------------------------------------------------------------
 * Combobox.InputGroupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Frame that holds the input, clear button, and trigger, and is the element the popup anchors to. Renders a `<div>` element.
 */
export const ComboboxInputGroupPrimitive = forwardRef<
    HTMLDivElement,
    ComboboxInputGroupPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    const { size, invalid } = useComboboxContext();
    const dataAttrs = createDataAttributes({ invalid });

    return (
        <BaseCombobox.InputGroup
            ref={ref}
            className={cn(styles.inputGroup({ size, invalid }), className)}
            {...dataAttrs}
            {...componentProps}
        />
    );
});
ComboboxInputGroupPrimitive.displayName = 'Combobox.InputGroupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.InputPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Text field where the user types to filter the options. Takes `placeholder` from `Combobox.Root` and the accessible name from the surrounding `Field.Label` or the `aria-label` and `aria-labelledby` of `Combobox.Root`. Renders an `<input>` element.
 */
export const ComboboxInputPrimitive = forwardRef<HTMLInputElement, ComboboxInputPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        const context = useComboboxContext();
        const { size, invalid, placeholder } = context;
        const dataAttrs = createDataAttributes({ invalid });

        return (
            <BaseCombobox.Input
                ref={ref}
                placeholder={placeholder}
                aria-label={context['aria-label']}
                aria-labelledby={context['aria-labelledby']}
                aria-invalid={invalid || undefined}
                className={cn(styles.input({ size }), className)}
                {...dataAttrs}
                {...componentProps}
            />
        );
    },
);
ComboboxInputPrimitive.displayName = 'Combobox.InputPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.ClearPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that clears the selected value. Shown only while a value is selected. Renders a `<button>` element.
 */
export const ComboboxClearPrimitive = forwardRef<HTMLButtonElement, ComboboxClearPrimitive.Props>(
    (props, ref) => {
        const {
            'aria-label': ariaLabel = 'Clear',
            className,
            children: childrenProp,
            ...componentProps
        } = resolveStyles(props);

        const { size, readOnly } = useComboboxContext();

        const childrenRender = createRender(childrenProp, <CloseOutlineIcon />);
        const children = useRenderElement({
            render: childrenRender,
            props: defaultIconProps(childrenProp),
        });

        if (readOnly) return null;

        return (
            <BaseCombobox.Clear
                ref={ref}
                aria-label={ariaLabel}
                className={cn(styles.iconButton({ size }), className)}
                {...componentProps}
            >
                {children}
            </BaseCombobox.Clear>
        );
    },
);
ComboboxClearPrimitive.displayName = 'Combobox.ClearPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.TriggerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button with a chevron icon that opens and closes the popup. Renders a `<button>` element.
 */
export const ComboboxTriggerPrimitive = forwardRef<
    HTMLButtonElement,
    ComboboxTriggerPrimitive.Props
>((props, ref) => {
    const {
        'aria-label': ariaLabel = 'Open popup',
        className,
        children: childrenProp,
        ...componentProps
    } = resolveStyles(props);

    const { size } = useComboboxContext();

    const childrenRender = createRender(childrenProp, <ChevronDownOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: defaultIconProps(childrenProp),
    });

    return (
        <BaseCombobox.Trigger
            ref={ref}
            aria-label={ariaLabel}
            className={cn(styles.iconButton({ size }), className)}
            {...componentProps}
        >
            {children}
        </BaseCombobox.Trigger>
    );
});
ComboboxTriggerPrimitive.displayName = 'Combobox.TriggerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.InputGroup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Combobox.InputGroupPrimitive`, `Combobox.InputPrimitive`, `Combobox.ClearPrimitive`, and `Combobox.TriggerPrimitive` into a single part. Use the primitives to change what it holds. Renders a `<div>` element.
 */
export const ComboboxInputGroup = forwardRef<HTMLDivElement, ComboboxInputGroup.Props>(
    (props, ref) => {
        return (
            <ComboboxInputGroupPrimitive ref={ref} {...props}>
                <ComboboxInputPrimitive />
                <ComboboxClearPrimitive />
                <ComboboxTriggerPrimitive />
            </ComboboxInputGroupPrimitive>
        );
    },
);
ComboboxInputGroup.displayName = 'Combobox.InputGroup';

/* -------------------------------------------------------------------------------------------------
 * Combobox.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Portal container that renders the popup outside the normal DOM hierarchy. Renders a `<div>` element.
 */
export const ComboboxPortalPrimitive = forwardRef<HTMLDivElement, ComboboxPortalPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BaseCombobox.Portal ref={ref} {...componentProps} />;
    },
);
ComboboxPortalPrimitive.displayName = 'Combobox.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Positions the popup against the input group and keeps it inside the viewport. Renders a `<div>` element.
 */
export const ComboboxPositionerPrimitive = forwardRef<
    HTMLDivElement,
    ComboboxPositionerPrimitive.Props
>((props, ref) => {
    const {
        side = 'bottom',
        align = 'start',
        sideOffset = 4,
        className,
        ...componentProps
    } = resolveStyles(props);

    return (
        <BaseCombobox.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(styles.positioner, className)}
            {...componentProps}
        />
    );
});
ComboboxPositionerPrimitive.displayName = 'Combobox.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The popup panel that holds the list. Renders a `<div>` element.
 */
export const ComboboxPopupPrimitive = forwardRef<HTMLDivElement, ComboboxPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseCombobox.Popup
                ref={ref}
                className={cn(styles.popup, className)}
                {...componentProps}
            />
        );
    },
);
ComboboxPopupPrimitive.displayName = 'Combobox.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.ListPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Scrollable container for the options. Renders a `<div>` element.
 */
export const ComboboxListPrimitive = forwardRef<HTMLDivElement, ComboboxListPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseCombobox.List
                ref={ref}
                className={cn(styles.list, className)}
                {...componentProps}
            />
        );
    },
);
ComboboxListPrimitive.displayName = 'Combobox.ListPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Combobox.PortalPrimitive`, `Combobox.PositionerPrimitive`, `Combobox.PopupPrimitive`, and `Combobox.ListPrimitive` into a single part that opens below the input group. Use the primitives to change the side, alignment, or container. Renders a `<div>` element.
 */
export const ComboboxPopup = forwardRef<HTMLDivElement, ComboboxPopup.Props>((props, ref) => {
    const { children, ...componentProps } = props;

    const nodes = Array.isArray(children) ? children : [children];
    const isEmpty = (node: unknown) => isValidElement(node) && node.type === ComboboxEmpty;

    const empties = nodes.filter(isEmpty) as ReactNode[];
    const listChildren = withCollections(nodes.filter((node) => !isEmpty(node)));

    return (
        <ComboboxPortalPrimitive>
            <ComboboxPositionerPrimitive>
                <ComboboxPopupPrimitive ref={ref} {...componentProps}>
                    {empties}
                    <ComboboxListPrimitive>{listChildren}</ComboboxListPrimitive>
                </ComboboxPopupPrimitive>
            </ComboboxPositionerPrimitive>
        </ComboboxPortalPrimitive>
    );
});
ComboboxPopup.displayName = 'Combobox.Popup';

/* -------------------------------------------------------------------------------------------------
 * Combobox.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Option in the list that the user can select. Renders a `<div>` element.
 */
export const ComboboxItemPrimitive = forwardRef<HTMLDivElement, ComboboxItemPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseCombobox.Item
                ref={ref}
                className={cn(styles.item, className)}
                {...componentProps}
            />
        );
    },
);
ComboboxItemPrimitive.displayName = 'Combobox.ItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.ItemIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Check mark shown while the item is selected. Renders a `<span>` element.
 */
export const ComboboxItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    ComboboxItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const childrenRender = createRender(childrenProp, <ConfirmOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: defaultIconProps(childrenProp),
    });

    return (
        <BaseCombobox.ItemIndicator
            ref={ref}
            className={cn(styles.itemIndicator, className)}
            {...componentProps}
        >
            {children}
        </BaseCombobox.ItemIndicator>
    );
});
ComboboxItemIndicatorPrimitive.displayName = 'Combobox.ItemIndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Combobox.Item
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Combobox.ItemPrimitive` and `Combobox.ItemIndicatorPrimitive` into a single part, with the check mark after the label. Renders a `<div>` element.
 */
export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItem.Props>((props, ref) => {
    const { children, ...componentProps } = props;

    return (
        <ComboboxItemPrimitive ref={ref} {...componentProps}>
            {children}

            <ComboboxItemIndicatorPrimitive />
        </ComboboxItemPrimitive>
    );
});
ComboboxItem.displayName = 'Combobox.Item';

/* -------------------------------------------------------------------------------------------------
 * Combobox.Group
 * -----------------------------------------------------------------------------------------------*/

/**
 * Groups related options under a `Combobox.GroupLabel`. Renders a `<div>` element.
 */
export const ComboboxGroup = forwardRef<HTMLDivElement, ComboboxGroup.Props>((props, ref) => {
    const { children, ...componentProps } = resolveStyles(props);

    return (
        <BaseCombobox.Group ref={ref} {...componentProps}>
            {withCollections(Array.isArray(children) ? children : [children])}
        </BaseCombobox.Group>
    );
});
ComboboxGroup.displayName = 'Combobox.Group';

/* -------------------------------------------------------------------------------------------------
 * Combobox.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

/**
 * Label for a group of options, announced to assistive technologies. Renders a `<div>` element.
 */
export const ComboboxGroupLabel = forwardRef<HTMLDivElement, ComboboxGroupLabel.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseCombobox.GroupLabel
                ref={ref}
                className={cn(styles.groupLabel, className)}
                {...componentProps}
            />
        );
    },
);
ComboboxGroupLabel.displayName = 'Combobox.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * Combobox.Separator
 * -----------------------------------------------------------------------------------------------*/

/**
 * Line that visually separates groups of options. Renders a `<div>` element.
 */
export const ComboboxSeparator = forwardRef<HTMLDivElement, ComboboxSeparator.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseCombobox.Separator
                ref={ref}
                className={cn(styles.separator, className)}
                {...componentProps}
            />
        );
    },
);
ComboboxSeparator.displayName = 'Combobox.Separator';

/* -------------------------------------------------------------------------------------------------
 * Combobox.Empty
 * -----------------------------------------------------------------------------------------------*/

/**
 * Message shown while no option matches the typed text. Requires the `items` prop on `Combobox.Root`. Renders a `<div>` element.
 */
export const ComboboxEmpty = forwardRef<HTMLDivElement, ComboboxEmpty.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseCombobox.Empty ref={ref} className={cn(styles.empty, className)} {...componentProps} />
    );
});
ComboboxEmpty.displayName = 'Combobox.Empty';

/* -----------------------------------------------------------------------------------------------*/

type ComboboxVariants = InputGroupVariants;
type ComboboxContext = ComboboxVariants &
    Pick<
        ComboboxRoot.Props<unknown>,
        'placeholder' | 'readOnly' | 'aria-label' | 'aria-labelledby'
    >;

export interface ComboboxRootProps<Value = unknown>
    extends ComboboxVariants, Omit<BaseCombobox.Root.Props<Value, false>, 'multiple'> {
    /**
     * Text shown in the input when it is empty.
     */
    placeholder?: string;

    /**
     * Accessible name for the input, for use when there is no visible `Field.Label`.
     */
    'aria-label'?: string;

    /**
     * Id of the element that labels the input, for use when there is no `Field.Label`.
     */
    'aria-labelledby'?: string;

    /**
     * Parts of the combobox, such as `Combobox.InputGroup` and `Combobox.Popup`.
     */
    children?: BaseCombobox.Root.Props<Value, false>['children'];
}

export namespace ComboboxRoot {
    export type State = BaseCombobox.Root.State;
    export type Props<Value = unknown> = ComboboxRootProps<Value>;

    export type Actions = BaseCombobox.Root.Actions;
    export type ChangeEventDetails = BaseCombobox.Root.ChangeEventDetails;
}

export namespace ComboboxInputGroupPrimitive {
    export type State = BaseCombobox.InputGroup.State;
    export interface Props extends VaporUIComponentProps<typeof BaseCombobox.InputGroup, State> {
        /**
         * Content shown inside the group, such as `Combobox.InputPrimitive`, `Combobox.ClearPrimitive`, and `Combobox.TriggerPrimitive`.
         */
        children?: BaseCombobox.InputGroup.Props['children'];
    }
}

export namespace ComboboxInputGroup {
    export type State = ComboboxInputGroupPrimitive.State;
    export interface Props extends ComboboxInputGroupPrimitive.Props {
        /**
         * Not rendered: the group always holds the input, clear button, and trigger. Use `Combobox.InputGroupPrimitive` to compose custom content.
         */
        children?: BaseCombobox.InputGroup.Props['children'];
    }
}

export namespace ComboboxInputPrimitive {
    export type State = BaseCombobox.Input.State;
    export type Props = VaporUIComponentProps<typeof BaseCombobox.Input, State>;
}

export namespace ComboboxClearPrimitive {
    export type State = BaseCombobox.Clear.State;
    export interface Props extends VaporUIComponentProps<typeof BaseCombobox.Clear, State> {
        /**
         * Icon shown in place of the default close icon.
         */
        children?: BaseCombobox.Clear.Props['children'];
    }
}

export namespace ComboboxTriggerPrimitive {
    export type State = BaseCombobox.Trigger.State;
    export interface Props extends VaporUIComponentProps<typeof BaseCombobox.Trigger, State> {
        /**
         * Icon shown in place of the default chevron icon.
         */
        children?: BaseCombobox.Trigger.Props['children'];
    }
}

export namespace ComboboxPortalPrimitive {
    export type State = BaseCombobox.Portal.State;
    export type Props = VaporUIComponentProps<typeof BaseCombobox.Portal, State>;
}

export namespace ComboboxPositionerPrimitive {
    export type State = BaseCombobox.Positioner.State;
    export type Props = VaporUIComponentProps<typeof BaseCombobox.Positioner, State>;
}

export namespace ComboboxPopupPrimitive {
    export type State = BaseCombobox.Popup.State;
    export interface Props extends VaporUIComponentProps<typeof BaseCombobox.Popup, State> {
        /**
         * Content shown in the popup, such as `Combobox.ListPrimitive`.
         */
        children?: BaseCombobox.Popup.Props['children'];
    }
}

export namespace ComboboxListPrimitive {
    export type State = BaseCombobox.List.State;
    export interface Props extends VaporUIComponentProps<typeof BaseCombobox.List, State> {
        /**
         * Options in the list. Pass a function to render each item of `items` on `Combobox.Root`, or render `Combobox.Item` elements directly.
         */
        children?: BaseCombobox.List.Props['children'];
    }
}

type ComboboxItemRenderer = BaseCombobox.Collection.Props['children'];
type ComboboxChildren = ReactNode | ComboboxItemRenderer | Array<ReactNode | ComboboxItemRenderer>;

export namespace ComboboxPopup {
    export type State = ComboboxPopupPrimitive.State;
    export interface Props extends Omit<ComboboxPopupPrimitive.Props, 'children'> {
        /**
         * Options shown in the list. Pass a function to render each item of `items` on `Combobox.Root` so the list is filtered, or render `Combobox.Item`, `Combobox.Group`, and `Combobox.Separator` elements directly. A direct child `Combobox.Empty` is placed above the list and may sit beside the function.
         */
        children?: ComboboxChildren;
    }
}

export namespace ComboboxItemPrimitive {
    export type State = BaseCombobox.Item.State;
    export interface Props extends VaporUIComponentProps<typeof BaseCombobox.Item, State> {
        /**
         * Content shown inside the option, such as its label and `Combobox.ItemIndicatorPrimitive`.
         */
        children?: BaseCombobox.Item.Props['children'];
    }
}

export namespace ComboboxItemIndicatorPrimitive {
    export type State = BaseCombobox.ItemIndicator.State;
    export interface Props extends VaporUIComponentProps<typeof BaseCombobox.ItemIndicator, State> {
        /**
         * Icon shown in place of the default check icon.
         */
        children?: BaseCombobox.ItemIndicator.Props['children'];
    }
}

export namespace ComboboxItem {
    export type State = ComboboxItemPrimitive.State;
    export interface Props extends ComboboxItemPrimitive.Props {
        /**
         * Label of the option, such as its text or an icon with text. The check mark is added after it.
         */
        children?: BaseCombobox.Item.Props['children'];
    }
}

export namespace ComboboxGroup {
    export type State = BaseCombobox.Group.State;
    export interface Props extends Omit<
        VaporUIComponentProps<typeof BaseCombobox.Group, State>,
        'children'
    > {
        /**
         * Group content, such as `Combobox.GroupLabel` and `Combobox.Item`. With the `items` prop, pass a function to render each item of the group so it is filtered.
         */
        children?: ComboboxChildren;
    }
}

export namespace ComboboxGroupLabel {
    export type State = BaseCombobox.GroupLabel.State;
    export type Props = VaporUIComponentProps<typeof BaseCombobox.GroupLabel, State>;
}

export namespace ComboboxSeparator {
    export type State = BaseCombobox.Separator.State;
    export type Props = VaporUIComponentProps<typeof BaseCombobox.Separator, State>;
}

export namespace ComboboxEmpty {
    export type State = BaseCombobox.Empty.State;
    export type Props = VaporUIComponentProps<typeof BaseCombobox.Empty, State>;
}
