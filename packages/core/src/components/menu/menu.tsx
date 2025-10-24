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

export const MenuRoot = (props: MenuRoot.Props) => {
    const [sharedProps, otherProps] = createSplitProps<MenuSharedProps>()(props, ['disabled']);

    const { disabled } = sharedProps;

    return (
        <MenuProvider value={sharedProps}>
            <BaseMenu.Root disabled={disabled} {...otherProps} />
        </MenuProvider>
    );
};
MenuRoot.displayName = 'Menu.Root';

/* -------------------------------------------------------------------------------------------------
 * Menu.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTrigger.Props>(
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
MenuTrigger.displayName = 'Menu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Menu.Portal
 * -----------------------------------------------------------------------------------------------*/

export const MenuPortal = BaseMenu.Portal;

/* -------------------------------------------------------------------------------------------------
 * Menu.Positioner
 * -----------------------------------------------------------------------------------------------*/

export const MenuPositioner = forwardRef<HTMLDivElement, MenuPositioner.Props>(
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

/* -------------------------------------------------------------------------------------------------
 * Menu.Popup
 * -----------------------------------------------------------------------------------------------*/

export const MenuPopup = forwardRef<HTMLDivElement, MenuPopup.Props>(
    ({ className, ...props }: MenuPopup.Props, ref) => {
        return <BaseMenu.Popup ref={ref} className={clsx(styles.popup, className)} {...props} />;
    },
);
MenuPopup.displayName = 'Menu.Popup';

/* -------------------------------------------------------------------------------------------------
 * Menu.Content
 * -----------------------------------------------------------------------------------------------*/

export const MenuContent = forwardRef<HTMLDivElement, MenuContent.Props>(
    ({ portalProps, positionerProps, className, ...props }: MenuContent.Props, ref) => {
        return (
            <MenuPortal {...portalProps}>
                <MenuPositioner {...positionerProps}>
                    <MenuPopup ref={ref} className={clsx(styles.popup, className)} {...props} />
                </MenuPositioner>
            </MenuPortal>
        );
    },
);
MenuContent.displayName = 'Menu.Content';

/* -------------------------------------------------------------------------------------------------
 * Menu.Item
 * -----------------------------------------------------------------------------------------------*/

export const MenuItem = forwardRef<HTMLDivElement, MenuItem.Props>(
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
MenuItem.displayName = 'Menu.Item';

/* -------------------------------------------------------------------------------------------------
 * Menu.Separator
 * -----------------------------------------------------------------------------------------------*/

export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparator.Props>(
    ({ className, ...props }, ref) => {
        return (
            <BaseMenu.Separator
                ref={ref}
                className={clsx(styles.separator, className)}
                {...props}
            />
        );
    },
);
MenuSeparator.displayName = 'Menu.Separator';

/* -------------------------------------------------------------------------------------------------
 * Menu.Group
 * -----------------------------------------------------------------------------------------------*/

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroup.Props>((props, ref) => {
    return <BaseMenu.Group ref={ref} {...props} />;
});
MenuGroup.displayName = 'Menu.Group';

/* -------------------------------------------------------------------------------------------------
 * Menu.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

export const MenuGroupLabel = forwardRef<HTMLDivElement, MenuGroupLabel.Props>(
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
MenuGroupLabel.displayName = 'Menu.GroupLabel';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuRoot
 * -----------------------------------------------------------------------------------------------*/

type SubmenuContext = {
    triggerRef?: RefObject<HTMLElement>;
    disabled?: boolean;
};

const [SubmenuProvider, useSubmenuContext] = createContext<SubmenuContext>();

export const MenuSubmenuRoot = ({
    closeParentOnEsc = false,
    disabled: disabledProp,
    ...props
}: MenuSubmenuRoot.Props) => {
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
MenuSubmenuRoot.displayName = 'Menu.SubmenuRoot';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuTriggerItem
 * -----------------------------------------------------------------------------------------------*/

export const MenuSubmenuTriggerItem = forwardRef<HTMLDivElement, MenuSubmenuTriggerItem.Props>(
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
MenuSubmenuTriggerItem.displayName = 'Menu.SubmenuTriggerItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuContent
 * -----------------------------------------------------------------------------------------------*/

export const MenuSubmenuPopup = forwardRef<HTMLDivElement, MenuSubmenuPopup.Props>(
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
MenuSubmenuPopup.displayName = 'Menu.SubmenuPopup';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuContent
 * -----------------------------------------------------------------------------------------------*/

export const MenuSubmenuContent = forwardRef<HTMLDivElement, MenuSubmenuContent.Props>(
    ({ portalProps, positionerProps, className, ...props }, ref) => {
        const { triggerRef } = useSubmenuContext();

        return (
            <MenuPortal {...portalProps}>
                <MenuPositioner side="right" align="start" sideOffset={0} {...positionerProps}>
                    <MenuSubmenuPopup
                        ref={ref}
                        finalFocus={triggerRef}
                        className={clsx(styles.subPopup, className)}
                        {...props}
                    />
                </MenuPositioner>
            </MenuPortal>
        );
    },
);
MenuSubmenuContent.displayName = 'Menu.SubmenuContent';

/* -------------------------------------------------------------------------------------------------
 * Menu.Checkbox
 * -----------------------------------------------------------------------------------------------*/

export const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItem.Props>(
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
MenuCheckboxItem.displayName = 'Menu.CheckboxItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioGroup
 * -----------------------------------------------------------------------------------------------*/

export const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroup.Props>((props, ref) => {
    return <BaseMenu.RadioGroup ref={ref} {...props} />;
});
MenuRadioGroup.displayName = 'Menu.RadioGroup';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItem
 * -----------------------------------------------------------------------------------------------*/

export const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItem.Props>(
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
MenuRadioItem.displayName = 'Menu.RadioItem';

/* -----------------------------------------------------------------------------------------------*/

export namespace MenuRoot {
    type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Root>;

    export interface Props extends RootPrimitiveProps, MenuSharedProps {}
    export type OpenEventDetails = BaseMenu.Root.ChangeEventDetails;
}

export namespace MenuTrigger {
    type TriggerPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace MenuPortal {
    type PortalPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace MenuPositioner {
    type PositionerPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Positioner>;
    export interface Props extends PositionerPrimitiveProps {}
}

export namespace MenuPopup {
    type PopupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace MenuContent {
    type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
    export interface Props extends ContentPrimitiveProps {
        portalProps?: MenuPortal.Props;
        positionerProps?: MenuPositioner.Props;
    }
}

export namespace MenuItem {
    type ItemPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Item>;
    export interface Props extends ItemPrimitiveProps {}
}

export namespace MenuSeparator {
    type SeparatorPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Separator>;
    export interface Props extends SeparatorPrimitiveProps {}
}

export namespace MenuGroup {
    type GroupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Group>;
    export interface Props extends GroupPrimitiveProps {}
}

export namespace MenuGroupLabel {
    type GroupLabelPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>;
    export interface Props extends GroupLabelPrimitiveProps {}
}

export namespace MenuSubmenuRoot {
    type SubmenuRootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.SubmenuRoot>;

    export interface Props extends SubmenuRootPrimitiveProps {
        closeParentOnEsc?: boolean;
    }
    export type OpenEventDetails = BaseMenu.SubmenuRoot.ChangeEventDetails;
}

export namespace MenuSubmenuTriggerItem {
    type SubmenuTriggerItemPrimitiveProps = ComponentPropsWithoutRef<
        typeof BaseMenu.SubmenuTrigger
    >;
    export interface Props extends SubmenuTriggerItemPrimitiveProps {}
}

export namespace MenuSubmenuPopup {
    type SubmenuPopupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
    export interface Props extends SubmenuPopupPrimitiveProps {}
}

export namespace MenuSubmenuContent {
    type SubmenuContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
    export interface Props extends SubmenuContentPrimitiveProps {
        portalProps?: MenuPortal.Props;
        positionerProps?: MenuPositioner.Props;
    }
}

export namespace MenuCheckboxItem {
    type CheckboxPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>;

    export interface Props extends CheckboxPrimitiveProps {}
    export type CheckedChangeEvent = BaseMenu.CheckboxItem.ChangeEventDetails;
}

export namespace MenuRadioGroup {
    type RadioGroupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.RadioGroup>;

    export interface Props extends RadioGroupPrimitiveProps {}
    export type ValueChangeEvent = BaseMenu.RadioGroup.ChangeEventDetails;
}

export namespace MenuRadioItem {
    type RadioItemPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>;
    export interface Props extends RadioItemPrimitiveProps {
        closeOnClick?: boolean;
    }
}
