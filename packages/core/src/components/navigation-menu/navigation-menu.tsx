'use client';

import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import { forwardRef } from 'react';

import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';

import { useArrowPosition } from '~/hooks/use-arrow-position';
import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { vars } from '~/styles/themes.css';
import { cn } from '~/utils/cn';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import { adaptStatefulCallbacks } from '~/utils/stateful-props';
import type { VaporUIComponentProps } from '~/utils/types';

import type { LinkVariants, ListVariants } from './navigation-menu.css';
import * as styles from './navigation-menu.css';

type NavigationMenuVariants = ListVariants & LinkVariants;
type NavigationMenuSharedProps = NavigationMenuVariants & { disabled?: boolean };
type NavigationMenuContextType = NavigationMenuSharedProps;

const [NavigationMenuProvider, useNavigationMenuContext] = createContext<NavigationMenuContextType>(
    {
        name: 'NavigationMenuContext',
        providerName: 'NavigationMenuProvider',
        hookName: 'useNavigationMenuContext',
    },
);

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Root
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuRoot = forwardRef<HTMLElement, NavigationMenuRoot.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const [variantProps, otherProps] = createSplitProps<NavigationMenuSharedProps>()(
            componentProps,
            ['direction', 'size', 'disabled'],
        );

        const { direction } = variantProps;

        return (
            <NavigationMenuProvider value={variantProps}>
                <BaseNavigationMenu.Root
                    ref={ref}
                    orientation={direction}
                    className={className}
                    {...otherProps}
                />
            </NavigationMenuProvider>
        );
    },
);
NavigationMenuRoot.displayName = 'NavigationMenu.Root';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.List
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuList.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { direction } = useNavigationMenuContext();

        return (
            <BaseNavigationMenu.List
                ref={ref}
                aria-orientation={undefined}
                className={cn(styles.list({ direction }), className)}
                {...componentProps}
            />
        );
    },
);
NavigationMenuList.displayName = 'NavigationMenu.List';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Item
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItem.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return <BaseNavigationMenu.Item ref={ref} className={className} {...componentProps} />;
    },
);
NavigationMenuItem.displayName = 'NavigationMenu.Item';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Link
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLink.Props>(
    (props, ref) => {
        const {
            current,
            href,
            disabled: disabledProp,
            className: classNameProp,
            style: styleProp,
            render: renderProp,
            ...componentProps
        } = resolveStyles(props);
        const { size, disabled: contextDisabled } = useNavigationMenuContext();

        const disabled = disabledProp ?? contextDisabled;
        const dataAttrs = createDataAttributes({
            disabled,
            current,
        });

        // NOTE: Base UI calls these with its own Link state; map it to the custom NavigationMenuLink state.
        // `active` is dropped, not just omitted from the type, so it doesn't leak through the spread.
        const { className, style, render } = adaptStatefulCallbacks(
            { className: classNameProp, style: styleProp, render: renderProp },
            ({ active, ...state }: BaseNavigationMenu.Link.State): NavigationMenuLink.State => ({
                ...state,
                current: active,
                disabled: !!disabled,
            }),
        );

        return (
            <BaseNavigationMenu.Link
                ref={ref}
                href={disabled ? undefined : href}
                aria-current={current ? 'page' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                active={current}
                className={cn(styles.link({ size }), className)}
                style={style}
                render={render}
                {...dataAttrs}
                {...componentProps}
            />
        );
    },
);
NavigationMenuLink.displayName = 'NavigationMenu.Link';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.TriggerPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuTriggerPrimitive = forwardRef<
    HTMLButtonElement,
    NavigationMenuTriggerPrimitive.Props
>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { size, disabled: contextDisabled } = useNavigationMenuContext();

    const disabled = disabledProp ?? contextDisabled;
    const dataAttrs = createDataAttributes({ disabled });

    return (
        <BaseNavigationMenu.Trigger
            ref={ref}
            disabled={disabled}
            className={cn(styles.link({ size }), styles.trigger, className)}
            {...dataAttrs}
            {...componentProps}
        />
    );
});
NavigationMenuTriggerPrimitive.displayName = 'NavigationMenu.TriggerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.TriggerIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuTriggerIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    NavigationMenuTriggerIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const childrenRender = createRender(childrenProp, <ChevronDownOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
    });

    return (
        <BaseNavigationMenu.Icon
            ref={ref}
            className={cn(styles.icon, className)}
            {...componentProps}
        >
            {children}
        </BaseNavigationMenu.Icon>
    );
});
NavigationMenuTriggerIndicatorPrimitive.displayName = 'NavigationMenu.TriggerIndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTrigger.Props>(
    (props, ref) => {
        const { children, ...componentProps } = props;

        return (
            <NavigationMenuTriggerPrimitive ref={ref} {...componentProps}>
                {children}

                <NavigationMenuTriggerIndicatorPrimitive />
            </NavigationMenuTriggerPrimitive>
        );
    },
);
NavigationMenuTrigger.displayName = 'NavigationMenu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Content
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContent.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseNavigationMenu.Content
                ref={ref}
                className={cn(styles.content, className)}
                {...componentProps}
            />
        );
    },
);
NavigationMenuContent.displayName = 'NavigationMenu.Content';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuPortalPrimitive = forwardRef<
    HTMLDivElement,
    NavigationMenuPortalPrimitive.Props
>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseNavigationMenu.Portal ref={ref} {...componentProps} />;
});
NavigationMenuPortalPrimitive.displayName = 'NavigationMenu.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuPositionerPrimitive = forwardRef<
    HTMLDivElement,
    NavigationMenuPositionerPrimitive.Props
>((props, ref) => {
    const {
        side = 'bottom',
        align = 'center',
        sideOffset = 10,
        collisionAvoidance,
        className,
        ...componentProps
    } = resolveStyles(props);

    return (
        <BaseNavigationMenu.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionAvoidance={{ align: 'none', ...collisionAvoidance }}
            className={cn(styles.positioner, className)}
            {...componentProps}
        />
    );
});
NavigationMenuPositionerPrimitive.displayName = 'NavigationMenu.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuPopupPrimitive = forwardRef<
    HTMLElement,
    NavigationMenuPopupPrimitive.Props
>((props, ref) => {
    const { className, children, ...componentProps } = resolveStyles(props);
    const { popupRef, arrowRef, position } = useArrowPosition();
    const composedRef = composeRefs(popupRef, ref);

    return (
        <BaseNavigationMenu.Popup
            ref={composedRef}
            className={cn(styles.popup, className)}
            {...componentProps}
        >
            <BaseNavigationMenu.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                <ArrowIcon />
            </BaseNavigationMenu.Arrow>

            {children}
        </BaseNavigationMenu.Popup>
    );
});
NavigationMenuPopupPrimitive.displayName = 'NavigationMenu.PopupPrimitive';

/* -----------------------------------------------------------------------------------------------*/

const ArrowIcon = (props: ComponentPropsWithoutRef<'svg'>) => {
    return (
        <svg
            width="16"
            height="7"
            viewBox="0 0 16 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M7.06543 1.17969C7.56267 0.620294 8.43733 0.620294 8.93457 1.17969L14.3301 7.25H1.66992L7.06543 1.17969Z"
                stroke={vars.color.border.normal}
                strokeWidth="1"
            />
            <path
                d="M8.75926 1.8858C8.36016 1.42019 7.63984 1.42019 7.24074 1.8858L2 8H14L8.75926 1.8858Z"
                fill="currentColor"
            />
        </svg>

        //         <svg xmlns="http://www.w3.org/2000/svg" width="7" height="16" viewBox="0 0 7 16" fill="none">
        // <g clip-path="url(#clip0_33569_6404)">
        // <path d="M5.82031 8.93457C6.37971 8.43733 6.37971 7.56267 5.82031 7.06543L-0.249999 1.66992L-0.25 14.3301L5.82031 8.93457Z" stroke="#E1E1E1" stroke-width="1.5"/>
        // <path d="M5.62805 7.24431C6.08814 7.64306 6.08814 8.35694 5.62805 8.75569L-1 14.5L-0.999999 1.5L5.62805 7.24431Z" fill="white"/>
        // </g>
        // <defs>
        // <clipPath id="clip0_33569_6404">
        // <rect width="16" height="7" fill="white" transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 7 16)"/>
        // </clipPath>
        // </defs>
        // </svg>
    );
};

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.ViewportPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuViewportPrimitive = forwardRef<
    HTMLDivElement,
    NavigationMenuViewportPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseNavigationMenu.Viewport
            ref={ref}
            className={cn(styles.viewport, className)}
            {...componentProps}
        />
    );
});
NavigationMenuViewportPrimitive.displayName = 'NavigationMenu.ViewportPrimitive';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Viewport
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuViewport = forwardRef<HTMLDivElement, NavigationMenuViewport.Props>(
    ({ portalElement, positionerElement, popupElement, ...props }, ref) => {
        const viewport = <NavigationMenuViewportPrimitive ref={ref} {...props} />;

        const popupRender = createRender(popupElement, <NavigationMenuPopupPrimitive />);
        const popup = useRenderElement({
            render: popupRender,
            props: { children: viewport },
        });

        const positionerRender = createRender(
            positionerElement,
            <NavigationMenuPositionerPrimitive />,
        );
        const positioner = useRenderElement({
            render: positionerRender,
            props: { children: popup },
        });

        const portalRender = createRender(portalElement, <NavigationMenuPortalPrimitive />);
        const portal = useRenderElement({
            render: portalRender,
            props: { children: positioner },
        });

        return portal;
    },
);
NavigationMenuViewport.displayName = 'NavigationMenu.Viewport';

/* -----------------------------------------------------------------------------------------------*/

export namespace NavigationMenuRoot {
    export type State = BaseNavigationMenu.Root.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Root, State> &
        NavigationMenuSharedProps;

    export type Actions = BaseNavigationMenu.Root.Actions;
    export type ChangeEventDetails = BaseNavigationMenu.Root.ChangeEventDetails;
}

export namespace NavigationMenuList {
    export type State = BaseNavigationMenu.List.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.List, State>;
}

export namespace NavigationMenuItem {
    export type State = BaseNavigationMenu.Item.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Item, State>;
}

export interface NavigationMenuLinkState extends Omit<BaseNavigationMenu.Link.State, 'active'> {
    /**
     * Whether the link is the currently active page.
     */
    current: boolean;
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
}

export interface NavigationMenuLinkProps extends Omit<
    VaporUIComponentProps<typeof BaseNavigationMenu.Link, NavigationMenuLink.State>,
    'active'
> {
    /**
     * Whether the link is the currently active page.
     * @default false
     */
    current?: boolean;
    /**
     * Whether the component should ignore user interaction.
     * @default false
     */
    disabled?: boolean;
}

export namespace NavigationMenuLink {
    export type State = NavigationMenuLinkState;
    export type Props = NavigationMenuLinkProps;
}

export namespace NavigationMenuTriggerPrimitive {
    export type State = BaseNavigationMenu.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Trigger, State>;
}

export namespace NavigationMenuTrigger {
    export type State = NavigationMenuTriggerPrimitive.State;
    export type Props = NavigationMenuTriggerPrimitive.Props;
}

export namespace NavigationMenuTriggerIndicatorPrimitive {
    export type State = BaseNavigationMenu.Icon.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Icon, State>;
}

export namespace NavigationMenuContent {
    export type State = BaseNavigationMenu.Content.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Content, State>;
}

export namespace NavigationMenuPortalPrimitive {
    export type State = BaseNavigationMenu.Portal.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Portal, State>;
}

export namespace NavigationMenuPositionerPrimitive {
    export type State = BaseNavigationMenu.Positioner.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Positioner, State>;
}

export namespace NavigationMenuPopupPrimitive {
    export type State = BaseNavigationMenu.Popup.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Popup, State>;
}

export namespace NavigationMenuViewportPrimitive {
    export type State = BaseNavigationMenu.Viewport.State;
    export type Props = VaporUIComponentProps<typeof BaseNavigationMenu.Viewport, State>;
}

export interface NavigationMenuViewportProps extends NavigationMenuViewportPrimitive.Props {
    /**
     * A Custom element for NavigationMenu.PortalPrimitive. If not provided, the default NavigationMenu.PortalPrimitive will be rendered.
     */
    portalElement?: ReactElement<NavigationMenuPortalPrimitive.Props>;
    /**
     * A Custom element for NavigationMenu.PositionerPrimitive. If not provided, the default NavigationMenu.PositionerPrimitive will be rendered.
     */
    positionerElement?: ReactElement<NavigationMenuPositionerPrimitive.Props>;
    /**
     * A Custom element for NavigationMenu.PopupPrimitive. If not provided, the default NavigationMenu.PopupPrimitive will be rendered.
     */
    popupElement?: ReactElement<NavigationMenuPopupPrimitive.Props>;
}

export namespace NavigationMenuViewport {
    export type State = NavigationMenuViewportPrimitive.State;
    export type Props = NavigationMenuViewportProps;
}
