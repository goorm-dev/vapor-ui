'use client';

import type { ReactElement, RefObject } from 'react';
import { forwardRef, useRef } from 'react';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { ChevronRightOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './menu.css';

type MenuContext = Pick<MenuRoot.Props, 'disabled'>;

const [MenuProvider, useMenuContext] = createContext<MenuContext>({
    name: 'Menu',
    hookName: 'useMenuContext',
    providerName: 'MenuProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Menu.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Menu compound component, a list of actions or options that opens from a trigger. Manages the open state and, when `disabled`, disables the trigger and every item. Doesn't render its own HTML element.
 */
export const MenuRoot = (props: MenuRoot.Props) => {
    const { disabled } = props;

    return (
        <MenuProvider value={{ disabled }}>
            <BaseMenu.Root {...props} />
        </MenuProvider>
    );
};
MenuRoot.displayName = 'Menu.Root';

/* -------------------------------------------------------------------------------------------------
 * Menu.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that opens the menu when clicked. Renders a `<button>` element.
 */
export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTrigger.Props>((props, ref) => {
    const { disabled: disabledProp, ...componentProps } = resolveStyles(props);
    const { disabled: contextDisabled } = useMenuContext();

    const disabled = disabledProp || contextDisabled;

    return <BaseMenu.Trigger ref={ref} disabled={disabled} {...componentProps} />;
});
MenuTrigger.displayName = 'Menu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Menu.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Portal container that renders the menu outside the normal DOM hierarchy. Renders a `<div>` element.
 */
export const MenuPortalPrimitive = forwardRef<HTMLDivElement, MenuPortalPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BaseMenu.Portal ref={ref} {...componentProps} />;
    },
);
MenuPortalPrimitive.displayName = 'Menu.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Positions the menu popup against its trigger and keeps it inside the viewport. Renders a `<div>` element.
 */
export const MenuPositionerPrimitive = forwardRef<HTMLDivElement, MenuPositionerPrimitive.Props>(
    (props, ref) => {
        // FIXME: Using resolveStyles causes all positioning-related style properties to reset, so it's temporarily disabled.
        const { side = 'bottom', align = 'start', sideOffset = 4, ...componentProps } = props;

        return (
            <BaseMenu.Positioner
                ref={ref}
                side={side}
                align={align}
                sideOffset={sideOffset}
                {...componentProps}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Menu.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The menu panel that holds the menu items. Renders a `<div>` element.
 */
export const MenuPopupPrimitive = forwardRef<HTMLDivElement, MenuPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseMenu.Popup ref={ref} className={cn(styles.popup, className)} {...componentProps} />
        );
    },
);
MenuPopupPrimitive.displayName = 'Menu.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.Content
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Menu.PortalPrimitive`, `Menu.PositionerPrimitive`, and `Menu.PopupPrimitive` into a single part. Use `portalElement` or `positionerElement` to replace the portal or positioner. Renders a `<div>` element.
 */
export const MenuPopup = forwardRef<HTMLDivElement, MenuPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <MenuPopupPrimitive ref={ref} {...props} />;

        const positionerRender = createRender(positionerElement, <MenuPositionerPrimitive />);
        const positioner = useRenderElement({
            render: positionerRender,
            props: { children: popup },
        });

        const portalRender = createRender(portalElement, <MenuPortalPrimitive />);
        const portal = useRenderElement({
            render: portalRender,
            props: { children: positioner },
        });

        return portal;
    },
);
MenuPopup.displayName = 'Menu.Popup';

/* -------------------------------------------------------------------------------------------------
 * Menu.Item
 * -----------------------------------------------------------------------------------------------*/

/**
 * Interactive item in the menu that runs an action when selected. Renders a `<div>` element.
 */
export const MenuItem = forwardRef<HTMLElement, MenuItem.Props>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { disabled: contextDisabled } = useMenuContext();

    const disabled = disabledProp || contextDisabled;

    return (
        <BaseMenu.Item
            ref={ref}
            disabled={disabled}
            className={cn(styles.item, className)}
            {...componentProps}
        />
    );
});
MenuItem.displayName = 'Menu.Item';

/* -------------------------------------------------------------------------------------------------
 * Menu.Separator
 * -----------------------------------------------------------------------------------------------*/

/**
 * Line that visually separates groups of menu items. Renders a `<div>` element.
 */
export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparator.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.Separator
            ref={ref}
            className={cn(styles.separator, className)}
            {...componentProps}
        />
    );
});
MenuSeparator.displayName = 'Menu.Separator';

/* -------------------------------------------------------------------------------------------------
 * Menu.Group
 * -----------------------------------------------------------------------------------------------*/

/**
 * Groups related menu items under a `Menu.GroupLabel`. Renders a `<div>` element.
 */
export const MenuGroup = forwardRef<HTMLDivElement, MenuGroup.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseMenu.Group ref={ref} {...componentProps} />;
});
MenuGroup.displayName = 'Menu.Group';

/* -------------------------------------------------------------------------------------------------
 * Menu.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

/**
 * Label for a menu group, announced to assistive technologies. Renders a `<div>` element.
 */
export const MenuGroupLabel = forwardRef<HTMLDivElement, MenuGroupLabel.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.GroupLabel
            ref={ref}
            className={cn(styles.groupLabel, className)}
            {...componentProps}
        />
    );
});
MenuGroupLabel.displayName = 'Menu.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuRoot
 * -----------------------------------------------------------------------------------------------*/

type SubmenuContext = {
    triggerRef?: RefObject<HTMLElement | null>;
    disabled?: boolean;
};

const [SubmenuProvider, useSubmenuContext] = createContext<SubmenuContext>();

/**
 * Root of a nested submenu inside a menu. Place `Menu.SubmenuTriggerItem` and `Menu.SubmenuPopup` inside it. Doesn't render its own HTML element.
 */
export const MenuSubmenuRoot = ({
    closeParentOnEsc = false,
    disabled: disabledProp,
    ...props
}: MenuSubmenuRoot.Props) => {
    const { disabled: disabledRoot } = useMenuContext();
    const disabled = disabledProp || disabledRoot;

    const triggerRef = useRef<HTMLElement>(null);

    return (
        <SubmenuProvider value={{ triggerRef, disabled }}>
            <BaseMenu.SubmenuRoot
                disabled={disabled}
                closeParentOnEsc={closeParentOnEsc}
                {...props}
            />
        </SubmenuProvider>
    );
};
MenuSubmenuRoot.displayName = 'Menu.SubmenuRoot';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuTriggerItem
 * -----------------------------------------------------------------------------------------------*/

/**
 * Menu item that opens a submenu, with a chevron icon at the end. Renders a `<div>` element.
 */
export const MenuSubmenuTriggerItem = forwardRef<HTMLElement, MenuSubmenuTriggerItem.Props>(
    (props, ref) => {
        const { className, children, ...componentProps } = resolveStyles(props);
        const { triggerRef } = useSubmenuContext();
        const composedRef = composeRefs(triggerRef, ref);

        return (
            <BaseMenu.SubmenuTrigger
                ref={composedRef}
                className={cn(styles.subTrigger, className)}
                {...componentProps}
            >
                {children}

                <ChevronRightOutlineIcon />
            </BaseMenu.SubmenuTrigger>
        );
    },
);
MenuSubmenuTriggerItem.displayName = 'Menu.SubmenuTriggerItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuPopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The submenu panel that holds the nested menu items. Returns focus to `Menu.SubmenuTriggerItem` when it closes. Renders a `<div>` element.
 */
export const MenuSubmenuPopupPrimitive = forwardRef<
    HTMLDivElement,
    MenuSubmenuPopupPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { triggerRef } = useSubmenuContext();

    return (
        <BaseMenu.Popup
            ref={ref}
            finalFocus={triggerRef}
            className={cn(styles.subPopup, className)}
            {...componentProps}
        />
    );
});
MenuSubmenuPopupPrimitive.displayName = 'Menu.SubmenuPopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuPopup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Menu.PortalPrimitive`, `Menu.PositionerPrimitive`, and `Menu.PopupPrimitive` into a single part that opens to the right of its trigger item. Use `portalElement` or `positionerElement` to replace the portal or positioner. Renders a `<div>` element.
 */
export const MenuSubmenuPopup = forwardRef<HTMLDivElement, MenuSubmenuPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const popup = <MenuPopupPrimitive ref={ref} {...props} />;

        const positionerRender = createRender(
            positionerElement,
            <MenuPositionerPrimitive side="right" sideOffset={0} />,
        );
        const positioner = useRenderElement({
            render: positionerRender,
            props: { children: popup },
        });

        const portalRender = createRender(portalElement, <MenuPortalPrimitive />);
        const portal = useRenderElement({
            render: portalRender,
            props: { children: positioner },
        });

        return portal;
    },
);
MenuSubmenuPopup.displayName = 'Menu.SubmenuPopup';

/* -------------------------------------------------------------------------------------------------
 * Menu.CheckboxItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Menu item that toggles a setting on or off. Renders a `<div>` element.
 */
export const MenuCheckboxItemPrimitive = forwardRef<HTMLElement, MenuCheckboxItem.Props>(
    (props, ref) => {
        const {
            disabled: disabledProp,
            className,
            children,
            ...componentProps
        } = resolveStyles(props);

        const { disabled: contextDisabled } = useMenuContext();
        const disabled = disabledProp || contextDisabled;

        return (
            <BaseMenu.CheckboxItem
                ref={ref}
                disabled={disabled}
                className={cn(styles.item, className)}
                {...componentProps}
            >
                {children}
            </BaseMenu.CheckboxItem>
        );
    },
);
MenuCheckboxItemPrimitive.displayName = 'Menu.CheckboxItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * MenuCheckboxItemIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Check mark shown while the checkbox item is checked. Renders a `<span>` element.
 */
export const MenuCheckboxItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    MenuCheckboxItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const childrenRender = createRender(childrenProp, <ConfirmOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: { width: '100%', height: '100%' },
    });

    return (
        <BaseMenu.CheckboxItemIndicator
            ref={ref}
            className={cn(styles.indicator, className)}
            {...componentProps}
        >
            {children}
        </BaseMenu.CheckboxItemIndicator>
    );
});
MenuCheckboxItemIndicatorPrimitive.displayName = 'Menu.CheckboxItemIndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.CheckboxItem
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Menu.CheckboxItemPrimitive` and `Menu.CheckboxItemIndicatorPrimitive` into a single part, with the check mark after the label. Renders a `<div>` element.
 */
export const MenuCheckboxItem = forwardRef<HTMLElement, MenuCheckboxItem.Props>((props, ref) => {
    const { children, ...componentProps } = props;

    return (
        <MenuCheckboxItemPrimitive ref={ref} {...componentProps}>
            {children}

            <MenuCheckboxItemIndicatorPrimitive />
        </MenuCheckboxItemPrimitive>
    );
});
MenuCheckboxItem.displayName = 'Menu.CheckboxItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioGroup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Groups radio items so that only one of them can be selected at a time. Renders a `<div>` element.
 */
export const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroup.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseMenu.RadioGroup ref={ref} {...componentProps} />;
});
MenuRadioGroup.displayName = 'Menu.RadioGroup';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Menu item that works like a radio button inside `Menu.RadioGroup`. Renders a `<div>` element.
 */
export const MenuRadioItemPrimitive = forwardRef<HTMLElement, MenuRadioItemPrimitive.Props>(
    (props, ref) => {
        const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);

        const { disabled: contextDisabled } = useMenuContext();
        const disabled = disabledProp || contextDisabled;

        return (
            <BaseMenu.RadioItem
                ref={ref}
                disabled={disabled}
                className={cn(styles.item, className)}
                {...componentProps}
            />
        );
    },
);
MenuRadioItemPrimitive.displayName = 'Menu.RadioItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItemIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Check mark shown while the radio item is selected. Renders a `<span>` element.
 */
export const MenuRadioItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    MenuRadioItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const childrenRender = createRender(childrenProp, <ConfirmOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: { width: '100%', height: '100%' },
    });

    return (
        <BaseMenu.RadioItemIndicator
            ref={ref}
            className={cn(styles.indicator, className)}
            {...componentProps}
        >
            {children}
        </BaseMenu.RadioItemIndicator>
    );
});

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItem
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Menu.RadioItemPrimitive` and `Menu.RadioItemIndicatorPrimitive` into a single part, with the check mark after the label. Renders a `<div>` element.
 */
export const MenuRadioItem = forwardRef<HTMLElement, MenuRadioItem.Props>((props, ref) => {
    const { children, ...componentProps } = props;

    return (
        <MenuRadioItemPrimitive ref={ref} {...componentProps}>
            {children}

            <MenuRadioItemIndicatorPrimitive className={styles.indicator}>
                <ConfirmOutlineIcon size="100%" />
            </MenuRadioItemIndicatorPrimitive>
        </MenuRadioItemPrimitive>
    );
});
MenuRadioItem.displayName = 'Menu.RadioItem';

/* -----------------------------------------------------------------------------------------------*/

export namespace MenuRoot {
    export type State = {};
    export type Props = BaseMenu.Root.Props;

    export type Actions = BaseMenu.Root.Actions;
    export type ChangeEventDetails = BaseMenu.Root.ChangeEventDetails;
}

export namespace MenuTrigger {
    export type State = BaseMenu.Trigger.State;
    export interface Props extends VaporUIComponentProps<typeof BaseMenu.Trigger, State> {
        /**
         * Content shown inside the trigger, such as a label or an icon.
         */
        children?: BaseMenu.Trigger.Props['children'];
    }
}

export namespace MenuPortalPrimitive {
    export type State = BaseMenu.Portal.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.Portal, State>;
}

export namespace MenuPositionerPrimitive {
    export type State = BaseMenu.Positioner.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.Positioner, State>;
}

export namespace MenuPopupPrimitive {
    export type State = BaseMenu.Popup.State;
    export interface Props extends VaporUIComponentProps<typeof BaseMenu.Popup, State> {
        /**
         * Menu items shown in the panel, such as `Menu.Item`, `Menu.Group`, or `Menu.Separator`.
         */
        children?: BaseMenu.Popup.Props['children'];
    }
}

export interface MenuPopupProps extends MenuPopupPrimitive.Props {
    /**
     * Replaces the default `Menu.PortalPrimitive`. Use to change the portal container.
     */
    portalElement?: ReactElement<MenuPortalPrimitive.Props>;

    /**
     * Replaces the default `Menu.PositionerPrimitive`. Use to change the side, alignment, or offset of the popup.
     */
    positionerElement?: ReactElement<MenuPositionerPrimitive.Props>;
}

export namespace MenuPopup {
    export type State = MenuPopupPrimitive.State;
    export type Props = MenuPopupProps;
}

export namespace MenuItem {
    export type State = BaseMenu.Item.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.Item, State>;
}

export namespace MenuSeparator {
    export type State = BaseMenu.Separator.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.Separator, State>;
}

export namespace MenuGroup {
    export type State = BaseMenu.Group.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.Group, State>;
}

export namespace MenuGroupLabel {
    export type State = BaseMenu.GroupLabel.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.GroupLabel, State>;
}

export namespace MenuSubmenuRoot {
    export type State = BaseMenu.SubmenuRoot.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.SubmenuRoot, State> & {};

    export type OpenEventDetails = BaseMenu.SubmenuRoot.ChangeEventDetails;
}

export namespace MenuSubmenuTriggerItem {
    export type State = BaseMenu.SubmenuTrigger.State;
    export interface Props extends VaporUIComponentProps<typeof BaseMenu.SubmenuTrigger, State> {
        /**
         * Called when the item is clicked.
         */
        onClick?: BaseMenu.SubmenuTrigger.Props['onClick'];
    }
}

export namespace MenuSubmenuPopupPrimitive {
    export type State = BaseMenu.Popup.State;
    export interface Props extends VaporUIComponentProps<typeof BaseMenu.Popup, State> {
        /**
         * Nested menu items shown in the submenu panel, such as `Menu.Item` or `Menu.CheckboxItem`.
         */
        children?: BaseMenu.Popup.Props['children'];
    }
}

export interface MenuSubmenuPopupProps extends MenuSubmenuPopupPrimitive.Props {
    /**
     * Replaces the default `Menu.PortalPrimitive`. Use to change the portal container.
     */
    portalElement?: ReactElement<MenuPortalPrimitive.Props>;

    /**
     * Replaces the default `Menu.PositionerPrimitive`. Use to change the side, alignment, or offset of the popup.
     */
    positionerElement?: ReactElement<MenuPositionerPrimitive.Props>;
}

export namespace MenuSubmenuPopup {
    export type State = MenuSubmenuPopupPrimitive.State;
    export type Props = MenuSubmenuPopupProps;
}

export namespace MenuCheckboxItemPrimitive {
    export type State = BaseMenu.CheckboxItem.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.CheckboxItem, State>;
    export type ChangeEventDetails = BaseMenu.CheckboxItem.ChangeEventDetails;
}

export namespace MenuCheckboxItemIndicatorPrimitive {
    export type State = BaseMenu.CheckboxItemIndicator.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.CheckboxItemIndicator, State>;
}

export namespace MenuCheckboxItem {
    export type State = MenuCheckboxItemPrimitive.State;
    export type Props = MenuCheckboxItemPrimitive.Props;
    export type ChangeEventDetails = MenuCheckboxItemPrimitive.ChangeEventDetails;
}

export namespace MenuRadioGroup {
    export type State = BaseMenu.RadioGroup.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.RadioGroup, State>;
    export type ChangeEventDetails = BaseMenu.RadioGroup.ChangeEventDetails;
}

export namespace MenuRadioItemPrimitive {
    export type State = BaseMenu.RadioItem.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.RadioItem, State> & {};
}

export namespace MenuRadioItemIndicatorPrimitive {
    export type State = BaseMenu.RadioItemIndicator.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.RadioItemIndicator, State>;
}

export namespace MenuRadioItem {
    export type State = MenuRadioItemPrimitive.State;
    export type Props = MenuRadioItemPrimitive.Props;
}
