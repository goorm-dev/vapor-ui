'use client';

import type { ComponentPropsWithoutRef, RefObject } from 'react';
import { forwardRef, useRef } from 'react';

import { Menu as BaseMenu } from '@base-ui-components/react';
import { ChevronRightOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { composeRefs } from '~/utils/compose-refs';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './menu.css';
import type { MenuItemVariants } from './menu.css';

type MenuVariants = MenuItemVariants;
type MenuSharedProps = MenuVariants;

type MenuContext = MenuSharedProps;

const [MenuProvider, useMenuContext] = createContext<MenuContext>({
    name: 'Menu',
    hookName: 'useMenuContext',
    providerName: 'MenuProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Menu.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Root>;
interface MenuRootProps extends RootPrimitiveProps, MenuSharedProps {}

/**
 * Provides the root context for a dropdown menu with multiple selectable options. Renders a <div> element.
 *
 * Documentation: [Menu Documentation](https://vapor-ui.goorm.io/docs/components/menu)
 */
const Root = ({ ...props }: MenuRootProps) => {
    const [sharedProps, otherProps] = createSplitProps<MenuSharedProps>()(props, ['disabled']);

    const { disabled } = sharedProps;

    return (
        <MenuProvider value={sharedProps}>
            <BaseMenu.Root disabled={disabled} {...otherProps} />
        </MenuProvider>
    );
};
Root.displayName = 'Menu.Root';

/* -------------------------------------------------------------------------------------------------
 * Menu.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Trigger>;
interface MenuTriggerProps extends TriggerPrimitiveProps {}

/**
 * Activates the menu when clicked or focused. Renders a <button> element.
 */
const Trigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
    ({ disabled: disabledProp, className, children, ...props }, ref) => {
        const { disabled: contextDisabled } = useMenuContext();

        const disabled = disabledProp || contextDisabled;

        return (
            <BaseMenu.Trigger ref={ref} disabled={disabled} {...props}>
                {children}
            </BaseMenu.Trigger>
        );
    },
);
Trigger.displayName = 'Menu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Menu.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Portal>;
interface MenuPortalProps extends PortalPrimitiveProps {}

/**
 * A portal element that moves the popup to a different part of the DOM. By default, the portal element is appended to <body>.
 */
const Portal = ({ ...props }: MenuPortalProps) => {
    return <BaseMenu.Portal {...props} />;
};
Portal.displayName = 'Menu.Portal';

/* -------------------------------------------------------------------------------------------------
 * Menu.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Positioner>;
interface MenuPositionerProps extends PositionerPrimitiveProps {}

/**
 * Positions the menu popup relative to its trigger element. Renders a <div> element.
 */
const Positioner = forwardRef<HTMLDivElement, MenuPositionerProps>(
    ({ side = 'bottom', align = 'start', sideOffset = 8, ...props }, ref) => {
        return (
            <BaseMenu.Positioner
                side={side}
                align={align}
                sideOffset={sideOffset}
                ref={ref}
                {...props}
            />
        );
    },
);

Positioner.displayName = 'Menu.Positioner';

/* -------------------------------------------------------------------------------------------------
 * Menu.Popup
 * -----------------------------------------------------------------------------------------------*/

type PopupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
interface MenuPopupProps extends PopupPrimitiveProps {}

/**
 * Contains the menu items and content. Renders a <div> element.
 */
const Popup = forwardRef<HTMLDivElement, MenuPopupProps>(
    ({ className, ...props }: MenuPopupProps, ref) => {
        return <BaseMenu.Popup ref={ref} className={clsx(styles.popup, className)} {...props} />;
    },
);
Popup.displayName = 'Menu.Popup';

/* -------------------------------------------------------------------------------------------------
 * Menu.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
interface MenuContentProps extends ContentPrimitiveProps {
    portalProps?: MenuPortalProps;
    positionerProps?: MenuPositionerProps;
}

/**
 * Combines Portal, Positioner, and Popup into a convenient wrapper component. Renders a <div> element.
 */
const Content = forwardRef<HTMLDivElement, MenuContentProps>(
    ({ portalProps, positionerProps, className, ...props }: MenuContentProps, ref) => {
        return (
            <Portal {...portalProps}>
                <Positioner {...positionerProps}>
                    <Popup ref={ref} className={clsx(styles.popup, className)} {...props} />
                </Positioner>
            </Portal>
        );
    },
);
Content.displayName = 'Menu.Content';

/* -------------------------------------------------------------------------------------------------
 * Menu.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Item>;
interface MenuItemProps extends ItemPrimitiveProps {}

/**
 * Displays an individual selectable menu item. Renders a <div> element.
 */
const Item = forwardRef<HTMLDivElement, MenuItemProps>(
    ({ disabled: disabledProp, className, ...props }, ref) => {
        const { disabled: contextDisabled } = useMenuContext();
        const disabled = disabledProp || contextDisabled;

        return (
            <BaseMenu.Item
                ref={ref}
                disabled={disabled}
                className={clsx(styles.item({ disabled }), className)}
                {...props}
            />
        );
    },
);
Item.displayName = 'Menu.Item';

/* -------------------------------------------------------------------------------------------------
 * Menu.Separator
 * -----------------------------------------------------------------------------------------------*/

type SeparatorPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Separator>;
interface MenuSeparatorProps extends SeparatorPrimitiveProps {}

/**
 * Displays a visual divider between menu items or groups. Renders a <div> element.
 */
const Separator = forwardRef<HTMLDivElement, MenuSeparatorProps>(({ className, ...props }, ref) => {
    return (
        <BaseMenu.Separator ref={ref} className={clsx(styles.separator, className)} {...props} />
    );
});
Separator.displayName = 'Menu.Separator';

/* -------------------------------------------------------------------------------------------------
 * Menu.Group
 * -----------------------------------------------------------------------------------------------*/

type GroupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Group>;
interface MenuGroupProps extends GroupPrimitiveProps {}

/**
 * Groups related menu items together with semantic organization. Renders a <div> element.
 */
const Group = forwardRef<HTMLDivElement, MenuGroupProps>((props, ref) => {
    return <BaseMenu.Group ref={ref} {...props} />;
});
Group.displayName = 'Menu.Group';

/* -------------------------------------------------------------------------------------------------
 * Menu.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

type GroupLabelPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>;
interface MenuGroupLabelProps extends GroupLabelPrimitiveProps {}

/**
 * Provides a descriptive label for menu item groups. Renders a <div> element.
 */
const GroupLabel = forwardRef<HTMLDivElement, MenuGroupLabelProps>(
    ({ className, ...props }, ref) => {
        return (
            <BaseMenu.GroupLabel
                ref={ref}
                className={clsx(styles.groupLabel, className)}
                {...props}
            />
        );
    },
);

GroupLabel.displayName = 'Menu.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuRoot
 * -----------------------------------------------------------------------------------------------*/

type SubmenuContext = {
    triggerRef?: RefObject<HTMLElement>;
    disabled?: boolean;
};

const [SubmenuProvider, useSubmenuContext] = createContext<SubmenuContext>();

type SubmenuRootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.SubmenuRoot>;
interface MenuSubmenuRootProps extends SubmenuRootPrimitiveProps {}

/**
 * Provides the root context for a nested submenu within a menu. Renders a <div> element.
 */
const SubmenuRoot = ({
    closeParentOnEsc = false,
    disabled: disabledProp,
    ...props
}: MenuSubmenuRootProps) => {
    const triggerRef = useRef<HTMLElement>(null);

    const { disabled: disabledRoot } = useMenuContext();
    const disabled = disabledProp || disabledRoot;

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
SubmenuRoot.displayName = 'Menu.SubmenuRoot';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuTriggerItem
 * -----------------------------------------------------------------------------------------------*/

type SubmenuTriggerItemPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>;
interface MenuSubmenuTriggerItemProps extends SubmenuTriggerItemPrimitiveProps {}

/**
 * Activates and triggers the opening of a submenu when clicked or focused. Renders a <div> element.
 */
const SubmenuTriggerItem = forwardRef<HTMLDivElement, MenuSubmenuTriggerItemProps>(
    ({ className, children, ...props }, ref) => {
        const { triggerRef, disabled } = useSubmenuContext();
        const composedRef = composeRefs(triggerRef, ref);

        return (
            <BaseMenu.SubmenuTrigger
                ref={composedRef}
                className={clsx(styles.subTrigger({ disabled }), className)}
                {...props}
            >
                {children}

                <ChevronRightOutlineIcon />
            </BaseMenu.SubmenuTrigger>
        );
    },
);
SubmenuTriggerItem.displayName = 'Menu.SubmenuTriggerItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuContent
 * -----------------------------------------------------------------------------------------------*/

type SubmenuPopupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
interface MenuSubmenuPopupProps extends SubmenuPopupPrimitiveProps {}

/**
 * Contains the popup content for a submenu. Renders a <div> element.
 */
const SubmenuPopup = forwardRef<HTMLDivElement, MenuSubmenuPopupProps>(
    ({ className, ...props }, ref) => {
        const { triggerRef } = useSubmenuContext();

        return (
            <BaseMenu.Popup
                ref={ref}
                finalFocus={triggerRef}
                className={clsx(styles.subPopup, className)}
                {...props}
            />
        );
    },
);
SubmenuPopup.displayName = 'Menu.SubmenuPopup';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuContent
 * -----------------------------------------------------------------------------------------------*/

type SubmenuContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
interface MenuSubmenuContentProps extends SubmenuContentPrimitiveProps {
    portalProps?: MenuPortalProps;
    positionerProps?: MenuPositionerProps;
}

/**
 * Combines Portal, Positioner, and SubmenuPopup into a convenient submenu wrapper component. Renders a <div> element.
 */
const SubmenuContent = forwardRef<HTMLDivElement, MenuSubmenuContentProps>(
    ({ portalProps, positionerProps, className, ...props }, ref) => {
        const { triggerRef } = useSubmenuContext();

        return (
            <Portal {...portalProps}>
                <Positioner side="right" align="start" sideOffset={0} {...positionerProps}>
                    <SubmenuPopup
                        ref={ref}
                        finalFocus={triggerRef}
                        className={clsx(styles.subPopup, className)}
                        {...props}
                    />
                </Positioner>
            </Portal>
        );
    },
);
SubmenuContent.displayName = 'Menu.SubmenuContent';

/* -------------------------------------------------------------------------------------------------
 * Menu.Checkbox
 * -----------------------------------------------------------------------------------------------*/

type CheckboxPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>;
interface MenuCheckboxItemProps extends CheckboxPrimitiveProps {}

/**
 * Displays a menu item with checkbox functionality for toggling selection state. Renders a <div> element.
 */
const CheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
    ({ disabled: disabledProp, className, children, ...props }, ref) => {
        const { disabled: contextDisabled } = useMenuContext();
        const disabled = disabledProp || contextDisabled;

        return (
            <BaseMenu.CheckboxItem
                ref={ref}
                disabled={disabled}
                className={clsx(styles.item({ disabled }), className)}
                {...props}
            >
                {children}

                <BaseMenu.CheckboxItemIndicator className={styles.indicator}>
                    <ConfirmOutlineIcon size="100%" />
                </BaseMenu.CheckboxItemIndicator>
            </BaseMenu.CheckboxItem>
        );
    },
);
CheckboxItem.displayName = 'Menu.CheckboxItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioGroup
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.RadioGroup>;
interface MenuRadioGroupProps extends RadioGroupPrimitiveProps {}

/**
 * Provides a group container for radio button menu items with mutual exclusivity. Renders a <div> element.
 */
const RadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>((props, ref) => {
    return <BaseMenu.RadioGroup ref={ref} {...props} />;
});
RadioGroup.displayName = 'Menu.RadioGroup';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItem
 * -----------------------------------------------------------------------------------------------*/

type RadioItemPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>;
interface MenuRadioItemProps extends RadioItemPrimitiveProps {
    closeOnClick?: boolean;
}

/**
 * Displays a menu item with radio button functionality for single selection within a group. Renders a <div> element.
 */
const RadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(
    ({ disabled: disabledProp, className, children, ...props }, ref) => {
        const { disabled: contextDisabled } = useMenuContext();
        const disabled = disabledProp || contextDisabled;

        return (
            <BaseMenu.RadioItem
                ref={ref}
                disabled={disabled}
                className={clsx(styles.item({ disabled }), className)}
                {...props}
            >
                {children}

                <BaseMenu.RadioItemIndicator className={styles.indicator}>
                    <ConfirmOutlineIcon size="100%" />
                </BaseMenu.RadioItemIndicator>
            </BaseMenu.RadioItem>
        );
    },
);
RadioItem.displayName = 'Menu.RadioItem';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as MenuRoot,
    Trigger as MenuTrigger,
    Portal as MenuPortal,
    Positioner as MenuPositioner,
    Popup as MenuPopup,
    Content as MenuContent,
    Item as MenuItem,
    Separator as MenuSeparator,
    Group as MenuGroup,
    GroupLabel as MenuGroupLabel,
    SubmenuRoot as MenuSubmenuRoot,
    SubmenuContent as MenuSubmenuContent,
    SubmenuTriggerItem as MenuSubmenuTriggerItem,
    CheckboxItem as MenuCheckboxItem,
    RadioGroup as MenuRadioGroup,
    RadioItem as MenuRadioItem,
};

export type {
    MenuRootProps,
    MenuTriggerProps,
    MenuPortalProps,
    MenuPositionerProps,
    MenuPopupProps,
    MenuContentProps,
    MenuItemProps,
    MenuSeparatorProps,
    MenuGroupProps,
    MenuGroupLabelProps,
    MenuSubmenuRootProps,
    MenuSubmenuContentProps,
    MenuSubmenuTriggerItemProps,
    MenuCheckboxItemProps,
    MenuRadioGroupProps,
    MenuRadioItemProps,
};

export const Menu = {
    Root,
    Trigger,
    Portal,
    Positioner,
    Popup,
    Content,
    Item,
    Separator,
    Group,
    GroupLabel,
    SubmenuRoot,
    SubmenuContent,
    SubmenuTriggerItem,
    CheckboxItem,
    RadioGroup,
    RadioItem,
};
