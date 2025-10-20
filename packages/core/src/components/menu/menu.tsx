'use client';

import type { RefObject } from 'react';
import { forwardRef, useRef } from 'react';

import { Menu as BaseMenu } from '@base-ui-components/react';
import { ChevronRightOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { composeRefs } from '~/utils/compose-refs';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './menu.css';

type MenuContext = Pick<MenuRootProps, 'disabled'>;

const [MenuProvider, useMenuContext] = createContext<MenuContext>({
    name: 'Menu',
    hookName: 'useMenuContext',
    providerName: 'MenuProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Menu.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = VComponentProps<typeof BaseMenu.Root>;
interface MenuRootProps extends RootPrimitiveProps {}

const Root = (props: MenuRootProps) => {
    const { disabled } = props;

    return (
        <MenuProvider value={{ disabled }}>
            <BaseMenu.Root {...props} />
        </MenuProvider>
    );
};
Root.displayName = 'Menu.Root';

/* -------------------------------------------------------------------------------------------------
 * Menu.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = VComponentProps<typeof BaseMenu.Trigger>;
interface MenuTriggerProps extends TriggerPrimitiveProps {}

const Trigger = forwardRef<HTMLButtonElement, MenuTriggerProps>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { disabled: contextDisabled } = useMenuContext();

    const disabled = disabledProp || contextDisabled;

    return <BaseMenu.Trigger ref={ref} disabled={disabled} {...componentProps} />;
});
Trigger.displayName = 'Menu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Menu.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = VComponentProps<typeof BaseMenu.Portal>;
interface MenuPortalProps extends PortalPrimitiveProps {}

const Portal = BaseMenu.Portal;

/* -------------------------------------------------------------------------------------------------
 * Menu.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerPrimitiveProps = VComponentProps<typeof BaseMenu.Positioner>;
interface MenuPositionerProps extends PositionerPrimitiveProps {}

const Positioner = forwardRef<HTMLDivElement, MenuPositionerProps>((props, ref) => {
    // FIXME: Using resolveStyles causes all positioning-related style properties to reset, so it's temporarily disabled.
    const { side = 'bottom', align = 'start', sideOffset = 8, ...componentProps } = props;

    return (
        <BaseMenu.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            {...componentProps}
        />
    );
});
Positioner.displayName = 'Menu.Positioner';

/* -------------------------------------------------------------------------------------------------
 * Menu.Popup
 * -----------------------------------------------------------------------------------------------*/

type PopupPrimitiveProps = VComponentProps<typeof BaseMenu.Popup>;
interface MenuPopupProps extends PopupPrimitiveProps {}

const Popup = forwardRef<HTMLDivElement, MenuPopupProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.Popup ref={ref} className={clsx(styles.popup, className)} {...componentProps} />
    );
});
Popup.displayName = 'Menu.Popup';

/* -------------------------------------------------------------------------------------------------
 * Menu.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = VComponentProps<typeof Popup>;
interface MenuContentProps extends ContentPrimitiveProps {
    portalProps?: MenuPortalProps;
    positionerProps?: MenuPositionerProps;
}

const Content = forwardRef<HTMLDivElement, MenuContentProps>(
    ({ portalProps, positionerProps, ...props }, ref) => {
        return (
            <Portal {...portalProps}>
                <Positioner {...positionerProps}>
                    <Popup ref={ref} {...props} />
                </Positioner>
            </Portal>
        );
    },
);
Content.displayName = 'Menu.Content';

/* -------------------------------------------------------------------------------------------------
 * Menu.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = VComponentProps<typeof BaseMenu.Item>;
interface MenuItemProps extends ItemPrimitiveProps {}

const Item = forwardRef<HTMLDivElement, MenuItemProps>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { disabled: contextDisabled } = useMenuContext();

    const disabled = disabledProp || contextDisabled;

    return (
        <BaseMenu.Item
            ref={ref}
            disabled={disabled}
            className={clsx(styles.item, className)}
            {...componentProps}
        />
    );
});
Item.displayName = 'Menu.Item';

/* -------------------------------------------------------------------------------------------------
 * Menu.Separator
 * -----------------------------------------------------------------------------------------------*/

type SeparatorPrimitiveProps = VComponentProps<typeof BaseMenu.Separator>;
interface MenuSeparatorProps extends SeparatorPrimitiveProps {}

const Separator = forwardRef<HTMLDivElement, MenuSeparatorProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.Separator
            ref={ref}
            className={clsx(styles.separator, className)}
            {...componentProps}
        />
    );
});
Separator.displayName = 'Menu.Separator';

/* -------------------------------------------------------------------------------------------------
 * Menu.Group
 * -----------------------------------------------------------------------------------------------*/

type GroupPrimitiveProps = VComponentProps<typeof BaseMenu.Group>;
interface MenuGroupProps extends GroupPrimitiveProps {}

const Group = forwardRef<HTMLDivElement, MenuGroupProps>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseMenu.Group ref={ref} {...componentProps} />;
});
Group.displayName = 'Menu.Group';

/* -------------------------------------------------------------------------------------------------
 * Menu.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

type GroupLabelPrimitiveProps = VComponentProps<typeof BaseMenu.GroupLabel>;
interface MenuGroupLabelProps extends GroupLabelPrimitiveProps {}

const GroupLabel = forwardRef<HTMLDivElement, MenuGroupLabelProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.GroupLabel
            ref={ref}
            className={clsx(styles.groupLabel, className)}
            {...componentProps}
        />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuRoot
 * -----------------------------------------------------------------------------------------------*/

type SubmenuContext = {
    triggerRef?: RefObject<HTMLElement>;
    disabled?: boolean;
};

const [SubmenuProvider, useSubmenuContext] = createContext<SubmenuContext>();

type SubmenuRootPrimitiveProps = VComponentProps<typeof BaseMenu.SubmenuRoot>;
interface MenuSubmenuRootProps extends SubmenuRootPrimitiveProps {}

const SubmenuRoot = (props: MenuSubmenuRootProps) => {
    const { closeParentOnEsc = false, disabled: disabledProp, ...componentProps } = props;
    const { disabled: disabledRoot } = useMenuContext();
    const disabled = disabledProp || disabledRoot;

    const triggerRef = useRef<HTMLElement>(null);

    return (
        <SubmenuProvider value={{ triggerRef, disabled }}>
            <BaseMenu.SubmenuRoot
                disabled={disabled}
                closeParentOnEsc={closeParentOnEsc}
                {...componentProps}
            />
        </SubmenuProvider>
    );
};
SubmenuRoot.displayName = 'Menu.SubmenuRoot';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuTriggerItem
 * -----------------------------------------------------------------------------------------------*/

type SubmenuTriggerItemPrimitiveProps = VComponentProps<typeof BaseMenu.SubmenuTrigger>;
interface MenuSubmenuTriggerItemProps extends SubmenuTriggerItemPrimitiveProps {}

const SubmenuTriggerItem = forwardRef<HTMLDivElement, MenuSubmenuTriggerItemProps>((props, ref) => {
    const { className, children, ...componentProps } = resolveStyles(props);
    const { triggerRef } = useSubmenuContext();
    const composedRef = composeRefs(triggerRef, ref);

    return (
        <BaseMenu.SubmenuTrigger
            ref={composedRef}
            className={clsx(styles.subTrigger, className)}
            {...componentProps}
        >
            {children}

            <ChevronRightOutlineIcon />
        </BaseMenu.SubmenuTrigger>
    );
});
SubmenuTriggerItem.displayName = 'Menu.SubmenuTriggerItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuContent
 * -----------------------------------------------------------------------------------------------*/

type SubmenuPopupPrimitiveProps = VComponentProps<typeof BaseMenu.Popup>;
interface MenuSubmenuPopupProps extends SubmenuPopupPrimitiveProps {}

const SubmenuPopup = forwardRef<HTMLDivElement, MenuSubmenuPopupProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { triggerRef } = useSubmenuContext();

    return (
        <BaseMenu.Popup
            ref={ref}
            finalFocus={triggerRef}
            className={clsx(styles.subPopup, className)}
            {...componentProps}
        />
    );
});
SubmenuPopup.displayName = 'Menu.SubmenuPopup';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuContent
 * -----------------------------------------------------------------------------------------------*/

type SubmenuContentPrimitiveProps = VComponentProps<typeof BaseMenu.Popup>;
interface MenuSubmenuContentProps extends SubmenuContentPrimitiveProps {
    portalProps?: MenuPortalProps;
    positionerProps?: MenuPositionerProps;
}

const SubmenuContent = forwardRef<HTMLDivElement, MenuSubmenuContentProps>((props, ref) => {
    const { portalProps, positionerProps, className, ...componentProps } = resolveStyles(props);
    const { triggerRef } = useSubmenuContext();

    return (
        <Portal {...portalProps}>
            <Positioner side="right" align="start" sideOffset={0} {...positionerProps}>
                <SubmenuPopup
                    ref={ref}
                    finalFocus={triggerRef}
                    className={clsx(styles.subPopup, className)}
                    {...componentProps}
                />
            </Positioner>
        </Portal>
    );
});
SubmenuContent.displayName = 'Menu.SubmenuContent';

/* -------------------------------------------------------------------------------------------------
 * Menu.Checkbox
 * -----------------------------------------------------------------------------------------------*/

type CheckboxPrimitiveProps = VComponentProps<typeof BaseMenu.CheckboxItem>;
interface MenuCheckboxItemProps extends CheckboxPrimitiveProps {}

const CheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>((props, ref) => {
    const { disabled: disabledProp, className, children, ...componentProps } = resolveStyles(props);
    const { disabled: contextDisabled } = useMenuContext();
    const disabled = disabledProp || contextDisabled;

    return (
        <BaseMenu.CheckboxItem
            ref={ref}
            disabled={disabled}
            className={clsx(styles.item, className)}
            {...componentProps}
        >
            {children}

            <BaseMenu.CheckboxItemIndicator className={styles.indicator}>
                <ConfirmOutlineIcon size="100%" />
            </BaseMenu.CheckboxItemIndicator>
        </BaseMenu.CheckboxItem>
    );
});
CheckboxItem.displayName = 'Menu.CheckboxItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioGroup
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupPrimitiveProps = VComponentProps<typeof BaseMenu.RadioGroup>;
interface MenuRadioGroupProps extends RadioGroupPrimitiveProps {}

const RadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseMenu.RadioGroup ref={ref} {...componentProps} />;
});
RadioGroup.displayName = 'Menu.RadioGroup';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItem
 * -----------------------------------------------------------------------------------------------*/

type RadioItemPrimitiveProps = VComponentProps<typeof BaseMenu.RadioItem>;
interface MenuRadioItemProps extends RadioItemPrimitiveProps {
    closeOnClick?: boolean;
}

const RadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>((props, ref) => {
    const { disabled: disabledProp, className, children, ...componentProps } = resolveStyles(props);
    const { disabled: contextDisabled } = useMenuContext();
    const disabled = disabledProp || contextDisabled;

    return (
        <BaseMenu.RadioItem
            ref={ref}
            disabled={disabled}
            className={clsx(styles.item, className)}
            {...componentProps}
        >
            {children}

            <BaseMenu.RadioItemIndicator className={styles.indicator}>
                <ConfirmOutlineIcon size="100%" />
            </BaseMenu.RadioItemIndicator>
        </BaseMenu.RadioItem>
    );
});
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
