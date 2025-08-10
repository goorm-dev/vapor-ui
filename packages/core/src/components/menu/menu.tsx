import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { forwardRef, useMemo, useState } from 'react';

import {
    DropdownMenuCheckboxItem as RadixCheckboxItem,
    DropdownMenuContent as RadixContent,
    DropdownMenuGroup as RadixGroup,
    DropdownMenuItem as RadixItem,
    DropdownMenuItemIndicator as RadixItemIndicator,
    DropdownMenuLabel as RadixLabel,
    DropdownMenuPortal as RadixPortal,
    DropdownMenuRadioGroup as RadixRadioGroup,
    DropdownMenuRadioItem as RadixRadioItem,
    DropdownMenu as RadixRoot,
    DropdownMenuSeparator as RadixSeparator,
    DropdownMenuSubContent as RadixSubmenuContent,
    DropdownMenuSub as RadixSubmenuRoot,
    DropdownMenuSubTrigger as RadixSubmenuTriggerItem,
    DropdownMenuTrigger as RadixTrigger,
} from '@radix-ui/react-dropdown-menu';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { ChevronRightOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useVaporId } from '~/hooks/use-vapor-id';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { PositionerProps } from '~/utils/split-positioner-props';
import { splitPositionerProps } from '~/utils/split-positioner-props';

import * as styles from './menu.css';
import type { MenuItemVariants } from './menu.css';

type MenuVariants = MenuItemVariants;
type MenuSharedProps = MenuVariants & PositionerProps;

type MenuContext = MenuSharedProps & { dir?: 'ltr' | 'rtl' };

const [MenuProvider, useMenuContext] = createContext<MenuContext>({
    name: 'Menu',
    hookName: 'useMenuContext',
    providerName: 'MenuProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Menu.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof RadixRoot>;
interface MenuRootProps extends RootPrimitiveProps, MenuSharedProps {}

const Root = ({ ...props }: MenuRootProps) => {
    const [sharedProps, otherProps] = createSplitProps<MenuSharedProps>()(props, [
        'disabled',
        'side',
        'align',
        'sideOffset',
        'alignOffset',
    ]);

    return (
        <MenuProvider value={{ dir: otherProps.dir, ...sharedProps }}>
            <RadixRoot {...otherProps} />
        </MenuProvider>
    );
};
Root.displayName = 'Menu.Root';

/* -------------------------------------------------------------------------------------------------
 * Menu.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = ComponentPropsWithoutRef<typeof RadixTrigger>;
interface MenuTriggerProps extends TriggerPrimitiveProps {}

const Trigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
    ({ disabled, className, children, ...props }, ref) => {
        const context = useMenuContext();
        const isDisabled = disabled || context.disabled;

        return (
            <RadixTrigger
                ref={ref}
                disabled={isDisabled}
                data-disabled={isDisabled}
                aria-controls={undefined}
                {...props}
            >
                {children}
            </RadixTrigger>
        );
    },
);
Trigger.displayName = 'Menu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Menu.Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalPrimitiveProps = ComponentPropsWithoutRef<typeof RadixPortal>;
interface MenuPortalProps extends PortalPrimitiveProps {}

const Portal = RadixPortal;
Portal.displayName = 'Menu.Portal';

/* -------------------------------------------------------------------------------------------------
 * Menu.Content
 * -----------------------------------------------------------------------------------------------*/

type ContentPrimitiveProps = ComponentPropsWithoutRef<typeof RadixContent>;
interface MenuContentProps extends Omit<ContentPrimitiveProps, keyof PositionerProps> {}

const Content = forwardRef<HTMLDivElement, MenuContentProps>(
    ({ className, ...props }: MenuContentProps, ref) => {
        const context = useMenuContext();
        const [positionerProps] = splitPositionerProps(context);

        return (
            <RadixContent
                ref={ref}
                className={clsx(styles.content, className)}
                {...positionerProps}
                {...props}
            />
        );
    },
);
Content.displayName = 'Menu.Content';

/* -------------------------------------------------------------------------------------------------
 * Menu.CombinedContent
 * -----------------------------------------------------------------------------------------------*/

type Container = Pick<MenuPortalProps, 'container'>;
interface MenuCombinedContentProps extends Container, MenuContentProps {}

const CombinedContent = forwardRef<HTMLDivElement, MenuCombinedContentProps>((props, ref) => {
    const [containerProps, otherProps] = createSplitProps<Container>()(props, ['container']);

    return (
        <Portal {...containerProps}>
            <Content ref={ref} {...otherProps} />
        </Portal>
    );
});
CombinedContent.displayName = 'Menu.CombinedContent';

/* -------------------------------------------------------------------------------------------------
 * Menu.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof RadixItem>, 'onSelect'>;
interface MenuItemProps extends ItemPrimitiveProps {
    closeOnClick?: boolean;
}

const Item = forwardRef<HTMLDivElement, MenuItemProps>(
    ({ disabled, closeOnClick = true, onClick, className, ...props }, ref) => {
        const context = useMenuContext();
        const isDisabled = disabled || context.disabled;

        const handleClick = (event: MouseEvent<HTMLDivElement>) => {
            if (!closeOnClick) event.preventDefault();
            onClick?.(event);
        };

        return (
            <RadixItem
                ref={ref}
                disabled={isDisabled}
                className={clsx(styles.item({ disabled: isDisabled }), className)}
                onClick={handleClick}
                {...props}
            />
        );
    },
);
Item.displayName = 'Menu.Item';

/* -------------------------------------------------------------------------------------------------
 * Menu.Separator
 * -----------------------------------------------------------------------------------------------*/

type SeparatorPrimitiveProps = ComponentPropsWithoutRef<typeof RadixSeparator>;
interface MenuSeparatorProps extends SeparatorPrimitiveProps {}

const Separator = forwardRef<HTMLDivElement, MenuSeparatorProps>(({ className, ...props }, ref) => {
    return <RadixSeparator ref={ref} className={clsx(styles.separator, className)} {...props} />;
});
Separator.displayName = 'Menu.Separator';

/* -------------------------------------------------------------------------------------------------
 * Menu.Group
 * -----------------------------------------------------------------------------------------------*/

type GroupContext = { setLabelId: (id: string | undefined) => void };

const [MenuGroupProvider, useMenuGroupContext] = createContext<GroupContext>({
    name: 'MenuGroup',
    hookName: 'useMenuGroupContext',
    providerName: 'MenuGroupProvider',
});

type GroupPrimitiveProps = ComponentPropsWithoutRef<typeof RadixGroup>;
interface MenuGroupProps extends GroupPrimitiveProps {}

const Group = forwardRef<HTMLDivElement, MenuGroupProps>((props, ref) => {
    const [labelId, setLabelId] = useState<string | undefined>(undefined);

    const context = useMemo(() => ({ setLabelId }), [setLabelId]);

    return (
        <MenuGroupProvider value={context}>
            <RadixGroup ref={ref} aria-labelledby={labelId} {...props} />
        </MenuGroupProvider>
    );
});
Group.displayName = 'Menu.Group';

/* -------------------------------------------------------------------------------------------------
 * Menu.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

type GroupLabelPrimitiveProps = ComponentPropsWithoutRef<typeof RadixLabel>;
interface MenuGroupLabelProps extends GroupLabelPrimitiveProps {}

const GroupLabel = forwardRef<HTMLDivElement, MenuGroupLabelProps>(
    ({ id: idProp, className, ...props }, ref) => {
        const id = useVaporId(idProp);
        const { setLabelId } = useMenuGroupContext();

        useIsoLayoutEffect(() => {
            setLabelId(id);

            return () => setLabelId(undefined);
        }, [id, setLabelId]);

        return (
            <RadixLabel
                ref={ref}
                id={id}
                role="presentation"
                className={clsx(styles.groupLabel, className)}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Menu.Submenu
 * -----------------------------------------------------------------------------------------------*/

type SubmenuRootPrimitiveProps = ComponentPropsWithoutRef<typeof RadixSubmenuRoot>;
interface MenuSubmenuRootProps extends SubmenuRootPrimitiveProps {}

const SubmenuRoot = ({ ...props }: MenuSubmenuRootProps) => {
    return <RadixSubmenuRoot {...props} />;
};
SubmenuRoot.displayName = 'Menu.SubmenuRoot';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuContent
 * -----------------------------------------------------------------------------------------------*/

type SubmenuContentPrimitiveProps = ComponentPropsWithoutRef<typeof RadixSubmenuContent>;
interface MenuSubmenuContentProps extends SubmenuContentPrimitiveProps {}

const SubmenuContent = forwardRef<HTMLDivElement, MenuSubmenuContentProps>(
    ({ className, onEscapeKeyDown, ...props }, ref) => {
        const { dir } = useMenuContext();
        const closeKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

        const handleEscapeKeyDown = (event: KeyboardEvent) => {
            event.preventDefault();

            dispatchSubmenuClose(event, closeKey);
            onEscapeKeyDown?.(event);
        };

        return (
            <RadixSubmenuContent
                ref={ref}
                className={clsx(styles.subContents, className)}
                onEscapeKeyDown={handleEscapeKeyDown}
                {...props}
            />
        );
    },
);
SubmenuContent.displayName = 'Menu.SubmenuContent';

/* -----------------------------------------------------------------------------------------------*/

/**
 * NOTE
 * - This function dispatches a keyboard event to close the submenu when the escape key is pressed.
 * - This is necessary because Radix UI does not provide a built-in way to close submenus with the escape key, and we need to manually trigger the close behavior.
 */
const dispatchSubmenuClose = (event: KeyboardEvent, closeKey: string) => {
    const leftArrowEvent = new KeyboardEvent('keydown', {
        key: closeKey,
        bubbles: true,
        cancelable: true,
    });

    event.target?.dispatchEvent(leftArrowEvent);
};

/* -------------------------------------------------------------------------------------------------
 * Menu.CombinedSubmenuContent
 * -----------------------------------------------------------------------------------------------*/

type CombinedSubmenuContentPrimitiveProps = ComponentPropsWithoutRef<typeof RadixSubmenuContent>;
interface MenuCombinedSubmenuContentProps extends Container, CombinedSubmenuContentPrimitiveProps {}

const CombinedSubmenuContent = forwardRef<HTMLDivElement, MenuCombinedSubmenuContentProps>(
    ({ className, ...props }, ref) => {
        const [containerProps, otherProps] = createSplitProps<Container>()(props, ['container']);

        return (
            <RadixPortal {...containerProps}>
                <SubmenuContent
                    ref={ref}
                    className={clsx(styles.subContents, className)}
                    {...otherProps}
                />
            </RadixPortal>
        );
    },
);
CombinedSubmenuContent.displayName = 'Menu.CombinedSubmenuContent';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuTriggerItem
 * -----------------------------------------------------------------------------------------------*/

type SubmenuTriggerItemPrimitiveProps = ComponentPropsWithoutRef<typeof RadixSubmenuTriggerItem>;
interface MenuSubmenuTriggerItemProps extends SubmenuTriggerItemPrimitiveProps {}

const SubmenuTriggerItem = forwardRef<HTMLDivElement, MenuSubmenuTriggerItemProps>(
    ({ disabled, className, children, ...props }, ref) => {
        const context = useMenuContext();
        const isDisabled = disabled || context.disabled;

        return (
            <RadixSubmenuTriggerItem
                ref={ref}
                className={clsx(styles.subTrigger({ disabled: isDisabled }), className)}
                disabled={isDisabled}
                {...props}
            >
                {children}

                <ChevronRightOutlineIcon />
            </RadixSubmenuTriggerItem>
        );
    },
);
SubmenuTriggerItem.displayName = 'Menu.SubmenuTriggerItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.Checkbox
 * -----------------------------------------------------------------------------------------------*/

type CheckedProps = {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    defaultChecked?: boolean;
};

type CheckboxPrimitiveProps = Omit<
    ComponentPropsWithoutRef<typeof RadixCheckboxItem>,
    keyof CheckedProps | 'onSelect'
>;

interface MenuCheckboxItemProps extends CheckboxPrimitiveProps, CheckedProps {
    closeOnClick?: boolean;
}

const CheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
    ({ disabled, closeOnClick = false, onClick, className, children, ...props }, ref) => {
        const [checkedProps, otherProps] = createSplitProps<CheckedProps>()(props, [
            'checked',
            'defaultChecked',
            'onCheckedChange',
        ]);

        const { checked, onCheckedChange, defaultChecked } = checkedProps;
        const [checkedState, setCheckedState] = useControllableState({
            prop: checked,
            defaultProp: defaultChecked || false,
            onChange: onCheckedChange,
        });

        const context = useMenuContext();
        const isDisabled = disabled || context.disabled;

        const handleClick = (event: MouseEvent<HTMLDivElement>) => {
            onClick?.(event);

            if (event.isDefaultPrevented() || isDisabled) return;
            if (!closeOnClick) event.preventDefault();
            setCheckedState((prev) => !prev);
        };

        return (
            <RadixCheckboxItem
                ref={ref}
                checked={checkedState}
                disabled={isDisabled}
                className={clsx(styles.item({ disabled: isDisabled }), className)}
                onClick={handleClick}
                {...otherProps}
            >
                {children}

                <RadixItemIndicator className={styles.indicator}>
                    <ConfirmOutlineIcon size="100%" />
                </RadixItemIndicator>
            </RadixCheckboxItem>
        );
    },
);
CheckboxItem.displayName = 'Menu.CheckboxItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioGroup
 * -----------------------------------------------------------------------------------------------*/

type ValueProps = {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
};

type RadioGroupPrimitiveProps = Omit<
    ComponentPropsWithoutRef<typeof RadixRadioGroup>,
    keyof ValueProps
>;

type MenuRadioGroupContext = {
    handleValueChange: (value: string) => void;
};

const [MenuRadioGroupProvider, useMenuRadioGroupContext] = createContext<MenuRadioGroupContext>({
    name: 'MenuRadioGroup',
    hookName: 'useMenuRadioGroupContext',
    providerName: 'MenuRadioGroupProvider',
});

interface MenuRadioGroupProps extends RadioGroupPrimitiveProps, ValueProps {}

const RadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>((props, ref) => {
    const [valueProps, otherProps] = createSplitProps<ValueProps>()(props, [
        'value',
        'defaultValue',
        'onValueChange',
    ]);

    const { value, onValueChange, defaultValue } = valueProps;
    const [valueState, setValueState] = useControllableState({
        prop: value,
        defaultProp: defaultValue || '',
        onChange: onValueChange,
    });

    const handleValueChange = (newValue: string) => {
        setValueState(newValue);
    };

    return (
        <MenuRadioGroupProvider value={{ handleValueChange }}>
            <RadixRadioGroup
                ref={ref}
                value={valueState}
                onValueChange={setValueState}
                {...otherProps}
            />
        </MenuRadioGroupProvider>
    );
});
RadioGroup.displayName = 'Menu.RadioGroup';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItem
 * -----------------------------------------------------------------------------------------------*/

type RadioItemPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof RadixRadioItem>, 'onSelect'>;
interface MenuRadioItemProps extends RadioItemPrimitiveProps {
    closeOnClick?: boolean;
}

const RadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(
    ({ disabled, closeOnClick = false, onClick, className, children, ...props }, ref) => {
        const context = useMenuContext();
        const { handleValueChange } = useMenuRadioGroupContext();
        const isDisabled = disabled || context.disabled;

        const handleClick = (event: MouseEvent<HTMLDivElement>) => {
            onClick?.(event);

            if (event.isDefaultPrevented() || isDisabled) return;
            if (!closeOnClick) event.preventDefault();

            handleValueChange(props.value);
        };

        return (
            <RadixRadioItem
                ref={ref}
                disabled={isDisabled}
                className={clsx(styles.item({ disabled: isDisabled }), className)}
                onClick={handleClick}
                {...props}
            >
                {children}

                <RadixItemIndicator className={styles.indicator}>
                    <ConfirmOutlineIcon size="100%" />
                </RadixItemIndicator>
            </RadixRadioItem>
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
    CombinedContent as MenuCombinedContent,
    Item as MenuItem,
    Separator as MenuSeparator,
    Group as MenuGroup,
    GroupLabel as MenuGroupLabel,
    SubmenuRoot as MenuSubmenuRoot,
    SubmenuContent as MenuSubmenuContent,
    CombinedSubmenuContent as MenuCombinedSubmenuContent,
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
    MenuCombinedContentProps,
    MenuItemProps,
    MenuSeparatorProps,
    MenuGroupProps,
    MenuGroupLabelProps,
    MenuSubmenuRootProps,
    MenuSubmenuContentProps,
    MenuCombinedSubmenuContentProps,
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
    CombinedContent,
    Item,
    Separator,
    Group,
    GroupLabel,
    SubmenuRoot,
    SubmenuContent,
    CombinedSubmenuContent,
    SubmenuTriggerItem,
    CheckboxItem,
    RadioGroup,
    RadioItem,
};
