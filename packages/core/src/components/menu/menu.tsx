'use client';

import type { ReactElement, RefObject } from 'react';
import { forwardRef, useRef } from 'react';

import { Menu as BaseMenu } from '@base-ui-components/react';
import { ChevronRightOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { composeRefs } from '~/utils/compose-refs';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

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

export const MenuPortalPrimitive = BaseMenu.Portal;

/* -------------------------------------------------------------------------------------------------
 * Menu.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

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

export const MenuPopupPrimitive = forwardRef<HTMLDivElement, MenuPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseMenu.Popup
                ref={ref}
                className={clsx(styles.popup, className)}
                {...componentProps}
            />
        );
    },
);
MenuPopupPrimitive.displayName = 'Menu.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.Content
 * -----------------------------------------------------------------------------------------------*/

export const MenuPopup = forwardRef<HTMLDivElement, MenuPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const PortalElement = useRenderElement(portalElement ?? <MenuPortalPrimitive />);
        const PositionerElement = useRenderElement(
            positionerElement ?? <MenuPositionerPrimitive />,
        );

        return (
            <PortalElement>
                <PositionerElement>
                    <MenuPopupPrimitive ref={ref} {...props} />
                </PositionerElement>
            </PortalElement>
        );
    },
);
MenuPopup.displayName = 'Menu.Popup';

/* -------------------------------------------------------------------------------------------------
 * Menu.Item
 * -----------------------------------------------------------------------------------------------*/

export const MenuItem = forwardRef<HTMLDivElement, MenuItem.Props>((props, ref) => {
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
MenuItem.displayName = 'Menu.Item';

/* -------------------------------------------------------------------------------------------------
 * Menu.Separator
 * -----------------------------------------------------------------------------------------------*/

export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparator.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.Separator
            ref={ref}
            className={clsx(styles.separator, className)}
            {...componentProps}
        />
    );
});
MenuSeparator.displayName = 'Menu.Separator';

/* -------------------------------------------------------------------------------------------------
 * Menu.Group
 * -----------------------------------------------------------------------------------------------*/

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroup.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseMenu.Group ref={ref} {...componentProps} />;
});
MenuGroup.displayName = 'Menu.Group';

/* -------------------------------------------------------------------------------------------------
 * Menu.GroupLabel
 * -----------------------------------------------------------------------------------------------*/

export const MenuGroupLabel = forwardRef<HTMLDivElement, MenuGroupLabel.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.GroupLabel
            ref={ref}
            className={clsx(styles.groupLabel, className)}
            {...componentProps}
        />
    );
});
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

export const MenuSubmenuTriggerItem = forwardRef<HTMLDivElement, MenuSubmenuTriggerItem.Props>(
    (props, ref) => {
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
    },
);
MenuSubmenuTriggerItem.displayName = 'Menu.SubmenuTriggerItem';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuPopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

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
            className={clsx(styles.subPopup, className)}
            {...componentProps}
        />
    );
});
MenuSubmenuPopupPrimitive.displayName = 'Menu.SubmenuPopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.SubmenuPopup
 * -----------------------------------------------------------------------------------------------*/

export const MenuSubmenuPopup = forwardRef<HTMLDivElement, MenuSubmenuPopup.Props>(
    ({ portalElement, positionerElement, ...props }, ref) => {
        const PortalElement = useRenderElement(portalElement ?? <MenuPortalPrimitive />);
        const PositionerElement = useRenderElement(
            positionerElement ?? <MenuPositionerPrimitive side="right" sideOffset={0} />,
        );

        return (
            <PortalElement>
                <PositionerElement>
                    <MenuSubmenuPopupPrimitive ref={ref} {...props} />
                </PositionerElement>
            </PortalElement>
        );
    },
);
MenuSubmenuPopup.displayName = 'Menu.SubmenuPopup';

/* -------------------------------------------------------------------------------------------------
 * Menu.CheckboxItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MenuCheckboxItemPrimitive = forwardRef<HTMLDivElement, MenuCheckboxItem.Props>(
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
                className={clsx(styles.item, className)}
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

export const MenuCheckboxItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    MenuCheckboxItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.CheckboxItemIndicator
            ref={ref}
            className={clsx(styles.indicator, className)}
            {...componentProps}
        >
            <ConfirmOutlineIcon size="100%" />
        </BaseMenu.CheckboxItemIndicator>
    );
});
MenuCheckboxItemIndicatorPrimitive.displayName = 'Menu.CheckboxItemIndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.CheckboxItem
 * -----------------------------------------------------------------------------------------------*/

export const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItem.Props>((props, ref) => {
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

export const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroup.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseMenu.RadioGroup ref={ref} {...componentProps} />;
});
MenuRadioGroup.displayName = 'Menu.RadioGroup';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MenuRadioItemPrimitive = forwardRef<HTMLDivElement, MenuRadioItemPrimitive.Props>(
    (props, ref) => {
        const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);

        const { disabled: contextDisabled } = useMenuContext();
        const disabled = disabledProp || contextDisabled;

        return (
            <BaseMenu.RadioItem
                ref={ref}
                disabled={disabled}
                className={clsx(styles.item, className)}
                {...componentProps}
            />
        );
    },
);
MenuRadioItemPrimitive.displayName = 'Menu.RadioItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItemIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const MenuRadioItemIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    MenuRadioItemIndicatorPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseMenu.RadioItemIndicator
            ref={ref}
            className={clsx(styles.indicator, className)}
            {...componentProps}
        >
            <ConfirmOutlineIcon size="100%" />
        </BaseMenu.RadioItemIndicator>
    );
});

/* -------------------------------------------------------------------------------------------------
 * Menu.RadioItem
 * -----------------------------------------------------------------------------------------------*/

export const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItem.Props>((props, ref) => {
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
    type RootPrimitiveProps = VComponentProps<typeof BaseMenu.Root>;
    export interface Props extends RootPrimitiveProps {}
    export type ChangeEventDetails = BaseMenu.Root.ChangeEventDetails;
}

export namespace MenuTrigger {
    type TriggerPrimitiveProps = VComponentProps<typeof BaseMenu.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace MenuPortalPrimitive {
    type PortalPrimitiveProps = VComponentProps<typeof BaseMenu.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace MenuPositionerPrimitive {
    type PositionerPrimitiveProps = VComponentProps<typeof BaseMenu.Positioner>;
    export interface Props extends PositionerPrimitiveProps {}
}

export namespace MenuPopupPrimitive {
    type PopupPrimitiveProps = VComponentProps<typeof BaseMenu.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace MenuPopup {
    export interface Props extends MenuPopupPrimitive.Props {
        portalElement?: ReactElement<MenuPortalPrimitive.Props>;
        positionerElement?: ReactElement<MenuPositionerPrimitive.Props>;
    }
}

export namespace MenuItem {
    type ItemPrimitiveProps = VComponentProps<typeof BaseMenu.Item>;
    export interface Props extends ItemPrimitiveProps {}
}

export namespace MenuSeparator {
    type SeparatorPrimitiveProps = VComponentProps<typeof BaseMenu.Separator>;
    export interface Props extends SeparatorPrimitiveProps {}
}

export namespace MenuGroup {
    type GroupPrimitiveProps = VComponentProps<typeof BaseMenu.Group>;
    export interface Props extends GroupPrimitiveProps {}
}

export namespace MenuGroupLabel {
    type GroupLabelPrimitiveProps = VComponentProps<typeof BaseMenu.GroupLabel>;
    export interface Props extends GroupLabelPrimitiveProps {}
}

export namespace MenuSubmenuRoot {
    type SubmenuRootPrimitiveProps = VComponentProps<typeof BaseMenu.SubmenuRoot>;
    export interface Props extends SubmenuRootPrimitiveProps {
        closeParentOnEsc?: boolean;
    }
    export type OpenEventDetails = BaseMenu.SubmenuRoot.ChangeEventDetails;
}

export namespace MenuSubmenuTriggerItem {
    type SubmenuTriggerItemPrimitiveProps = VComponentProps<typeof BaseMenu.SubmenuTrigger>;
    export interface Props extends SubmenuTriggerItemPrimitiveProps {}
}

export namespace MenuSubmenuPopupPrimitive {
    type SubmenuPopupPrimitivePrimitiveProps = VComponentProps<typeof BaseMenu.Popup>;
    export interface Props extends SubmenuPopupPrimitivePrimitiveProps {}
}

export namespace MenuSubmenuPopup {
    export interface Props extends MenuSubmenuPopupPrimitive.Props {
        portalElement?: ReactElement<MenuPortalPrimitive.Props>;
        positionerElement?: ReactElement<MenuPositionerPrimitive.Props>;
    }
}

export namespace MenuCheckboxItemPrimitive {
    type CheckboxPrimitiveProps = VComponentProps<typeof BaseMenu.CheckboxItem>;
    export interface Props extends CheckboxPrimitiveProps {}
    export type ChangeEventDetails = BaseMenu.CheckboxItem.ChangeEventDetails;
}

export namespace MenuCheckboxItemIndicatorPrimitive {
    type CheckboxIndicatorPrimitiveProps = VComponentProps<typeof BaseMenu.CheckboxItemIndicator>;
    export interface Props extends CheckboxIndicatorPrimitiveProps {}
}

export namespace MenuCheckboxItem {
    export interface Props extends MenuCheckboxItemPrimitive.Props {}
    export type ChangeEventDetails = MenuCheckboxItemPrimitive.ChangeEventDetails;
}

export namespace MenuRadioGroup {
    type RadioGroupPrimitiveProps = VComponentProps<typeof BaseMenu.RadioGroup>;
    export interface Props extends RadioGroupPrimitiveProps {}
    export type ChangeEventDetails = BaseMenu.RadioGroup.ChangeEventDetails;
}

export namespace MenuRadioItemPrimitive {
    type RadioItemPrimitiveProps = VComponentProps<typeof BaseMenu.RadioItem>;
    export interface Props extends RadioItemPrimitiveProps {
        closeOnClick?: boolean;
    }
}

export namespace MenuRadioItemIndicatorPrimitive {
    type RadioItemPrimitiveProps = VComponentProps<typeof BaseMenu.RadioItemIndicator>;
    export interface Props extends RadioItemPrimitiveProps {}
}

export namespace MenuRadioItem {
    export interface Props extends MenuRadioItemPrimitive.Props {}
}
