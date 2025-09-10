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

const Portal = BaseMenu.Portal;

/* -------------------------------------------------------------------------------------------------
 * Menu.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Positioner>;
interface MenuPositionerProps extends PositionerPrimitiveProps {}

const Positioner = forwardRef<HTMLDivElement, MenuPositionerProps>((props, ref) => {
    return <BaseMenu.Positioner ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Menu.Popup
 * -----------------------------------------------------------------------------------------------*/

type PopupPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
interface MenuPopupProps extends PopupPrimitiveProps {}

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
interface MenuContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, MenuContentProps>(
    ({ className, ...props }: MenuContentProps, ref) => {
        return (
            <Portal>
                <Positioner side="bottom" align="start" sideOffset={8}>
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

const Group = forwardRef<HTMLDivElement, MenuGroupProps>((props, ref) => {
    return <BaseMenu.Group ref={ref} {...props} />;
});
Group.displayName = 'Menu.Group';

/* -------------------------------------------------------------------------------------------------
 * Menu.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

type GroupLabelPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>;
interface MenuGroupLabelProps extends GroupLabelPrimitiveProps {}

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
interface MenuSubmenuContentProps extends SubmenuContentPrimitiveProps {}

const SubmenuContent = forwardRef<HTMLDivElement, MenuSubmenuContentProps>(
    ({ className, ...props }, ref) => {
        const { triggerRef } = useSubmenuContext();

        return (
            <Portal>
                <Positioner side="right" align="start">
                    <Popup
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
