import type { ComponentPropsWithoutRef, RefObject } from 'react';
import { forwardRef, useRef } from 'react';

import { Menu as BaseMenu } from '@base-ui-components/react';
import { ChevronRightOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { composeRefs } from '~/utils/compose-refs';
import { createSplitProps } from '~/utils/create-split-props';
import type { OnlyPositionerProps } from '~/utils/positioner-props';

import * as styles from './menu.css';
import type { MenuItemVariants } from './menu.css';

type PositionerProps = OnlyPositionerProps<typeof BaseMenu.Positioner>;

type MenuVariants = MenuItemVariants;
type MenuSharedProps = MenuVariants & PositionerProps;

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
    const [sharedProps, otherProps] = createSplitProps<MenuSharedProps>()(props, [
        'disabled',
        'align',
        'alignOffset',
        'side',
        'sideOffset',
        'anchor',
        'arrowPadding',
        'collisionAvoidance',
        'collisionBoundary',
        'collisionPadding',
        'positionMethod',
        'sticky',
        'trackAnchor',
    ]);

    const { disabled } = sharedProps;

    return (
        // TODO:
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
 * Menu.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
interface MenuContentProps extends ContentPrimitiveProps {}

const Content = forwardRef<HTMLDivElement, MenuContentProps>(
    ({ className, ...props }: MenuContentProps, ref) => {
        const context = useMenuContext();
        const [positionerProps] = createSplitProps<PositionerProps>()(context, [
            'align',
            'alignOffset',
            'side',
            'sideOffset',
            'anchor',
            'arrowPadding',
            'collisionAvoidance',
            'collisionBoundary',
            'collisionPadding',
            'positionMethod',
            'sticky',
            'trackAnchor',
        ]);

        return (
            <BaseMenu.Positioner {...positionerProps}>
                <BaseMenu.Popup ref={ref} className={clsx(styles.content, className)} {...props} />
            </BaseMenu.Positioner>
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

const [SubmenuProvider, useSubmenuContext] = createContext<SubmenuContext>({});

type SubmenuRootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.SubmenuRoot>;
interface MenuSubmenuRootProps extends SubmenuRootPrimitiveProps {}

const SubmenuRoot = ({ closeParentOnEsc = false, disabled, ...props }: MenuSubmenuRootProps) => {
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
SubmenuRoot.displayName = 'Menu.SubmenuRoot';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuContent
 * -----------------------------------------------------------------------------------------------*/

type SubmenuContentPrimitiveProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
interface MenuSubmenuContentProps extends SubmenuContentPrimitiveProps {}

const SubmenuContent = forwardRef<HTMLDivElement, MenuSubmenuContentProps>(
    ({ className, ...props }, ref) => {
        const { triggerRef } = useSubmenuContext();

        return (
            <BaseMenu.Positioner>
                <BaseMenu.Popup
                    ref={ref}
                    finalFocus={triggerRef}
                    className={clsx(styles.subContents, className)}
                    {...props}
                />
            </BaseMenu.Positioner>
        );
    },
);
SubmenuContent.displayName = 'Menu.SubmenuContent';

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
                // TODO: adjust Submenu disabled
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
