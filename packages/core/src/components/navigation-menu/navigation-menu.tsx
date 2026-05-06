'use client';

import type { ComponentProps, ReactElement, RefObject } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';

import { useArrowPosition } from '~/hooks/use-arrow-position';
import { useMutationObserverRef } from '~/hooks/use-mutation-observer-ref';
import { useRenderElement } from '~/hooks/use-render-element';
import { useVaporId } from '~/hooks/use-vapor-id';
import { createContext } from '~/libs/create-context';
import { vars } from '~/styles/themes.css';
import { cn } from '~/utils/cn';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { LinkVariants, ListVariants } from './navigation-menu.css';
import * as styles from './navigation-menu.css';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenuArrowContext (internal)
 * -----------------------------------------------------------------------------------------------*/

interface NavigationMenuArrowContextValue {
    activeTriggerElement: Element | null;
    setActiveTriggerElement: (element: Element | null) => void;
    positionerRef: RefObject<HTMLElement | null>;
}

const [NavigationMenuArrowProvider, useNavigationMenuArrowContext] =
    createContext<NavigationMenuArrowContextValue>({
        name: 'NavigationMenuArrowContext',
        strict: false,
        hookName: 'useNavigationMenuArrowContext',
        providerName: 'NavigationMenuRoot',
    });

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

        const [activeTriggerElement, setActiveTriggerElement] = useState<Element | null>(null);
        const positionerRef = useRef<HTMLElement>(null);

        return (
            <NavigationMenuArrowProvider
                value={{ activeTriggerElement, setActiveTriggerElement, positionerRef }}
            >
                <NavigationMenuProvider value={variantProps}>
                    <BaseNavigationMenu.Root
                        ref={ref}
                        orientation={direction}
                        className={className}
                        {...otherProps}
                    />
                </NavigationMenuProvider>
            </NavigationMenuArrowProvider>
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
            ...componentProps
        } = resolveStyles(props);
        const { size, disabled: contextDisabled } = useNavigationMenuContext();

        const disabled = disabledProp ?? contextDisabled;
        const dataAttrs = createDataAttributes({
            disabled,
            current,
        });

        // NOTE: Preprocessing `classNameProp` below to account for the custom NavigationMenuLink State type.
        const className =
            typeof classNameProp === 'function'
                ? (state: BaseNavigationMenu.Link.State) =>
                      classNameProp({ ...state, current: state.active, disabled: !!disabled })
                : classNameProp;

        return (
            <BaseNavigationMenu.Link
                ref={ref}
                href={disabled ? undefined : href}
                aria-current={current ? 'page' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                active={current}
                className={cn(styles.link({ size }), className)}
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
    const { setActiveTriggerElement } = useNavigationMenuArrowContext() ?? {};

    const internalRef = useRef<HTMLButtonElement>(null);
    const composedRef = composeRefs(internalRef, ref);

    useEffect(() => {
        const node = internalRef.current;
        if (!node || !setActiveTriggerElement) return;

        if (node.hasAttribute('data-popup-open')) {
            setActiveTriggerElement(node);
        }

        const observer = new MutationObserver(() => {
            if (node.hasAttribute('data-popup-open')) {
                setActiveTriggerElement(node);
            }
        });
        observer.observe(node, { attributes: true, attributeFilter: ['data-popup-open'] });

        return () => observer.disconnect();
    }, [setActiveTriggerElement]);

    const disabled = disabledProp ?? contextDisabled;
    const dataAttrs = createDataAttributes({ disabled });

    return (
        <BaseNavigationMenu.Trigger
            ref={composedRef}
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
        sideOffset = 8,
        collisionAvoidance,
        className,
        ...componentProps
    } = resolveStyles(props);
    const { positionerRef } = useNavigationMenuArrowContext() ?? {};
    const composedRef = composeRefs(positionerRef, ref);

    return (
        <BaseNavigationMenu.Positioner
            ref={composedRef}
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

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

export const NavigationMenuPopupPrimitive = forwardRef<
    HTMLElement,
    NavigationMenuPopupPrimitive.Props
>((props, ref) => {
    const { className, children, ...componentProps } = resolveStyles(props);
    const [side, setSide] = useState<NavigationMenuPositionerPrimitive.Props['side']>();
    const [align, setAlign] = useState<NavigationMenuPositionerPrimitive.Props['align']>();

    const { activeTriggerElement, positionerRef } = useNavigationMenuArrowContext() ?? {};
    const arrowDimensions = { width: 16, height: 8 };
    const arrowStyle = useArrowPosition({
        triggerElement: activeTriggerElement ?? null,
        positionerElement: positionerRef?.current ?? null,
        side: side ?? 'bottom',
        align: align ?? 'center',
        arrowDimensions,
    });

    const popupRef = useRef<HTMLDivElement>(null);
    const composedRef = composeRefs(popupRef, ref);

    useEffect(() => {
        if (!popupRef.current) return;

        const dataset = popupRef.current.dataset;
        const { side: initialSide, align: initialAlign } = extractPositions(dataset);

        if (initialSide) setSide(initialSide);
        if (initialAlign) setAlign(initialAlign);
    }, []);

    const arrowRef = useMutationObserverRef<HTMLDivElement>({
        callback: (mutations) => {
            mutations.forEach((mutation) => {
                const { attributeName, target: mutationTarget } = mutation;

                const dataset = (mutationTarget as HTMLElement).dataset;
                const { side: nextSide, align: nextAlign } = extractPositions(dataset);

                if (attributeName === DATA_SIDE && nextSide) setSide(nextSide);
                if (attributeName === DATA_ALIGN && nextAlign) setAlign(nextAlign);
            });
        },
        options: { attributes: true, attributeFilter: [DATA_SIDE, DATA_ALIGN] },
    });

    return (
        <BaseNavigationMenu.Popup
            ref={composedRef}
            className={cn(styles.popup, className)}
            {...componentProps}
        >
            <BaseNavigationMenu.Arrow
                ref={arrowRef}
                style={{
                    ...arrowStyle,
                }}
                className={styles.arrow}
            >
                <ArrowIcon />
            </BaseNavigationMenu.Arrow>

            {children}
        </BaseNavigationMenu.Popup>
    );
});
NavigationMenuPopupPrimitive.displayName = 'NavigationMenu.PopupPrimitive';

const extractPositions = (dataset: DOMStringMap) => {
    const currentSide = dataset.side as NavigationMenuPositionerPrimitive.Props['side'];
    const currentAlign = dataset.align as NavigationMenuPositionerPrimitive.Props['align'];
    return { side: currentSide, align: currentAlign };
};

/* -----------------------------------------------------------------------------------------------*/
const ArrowIcon = (props: ComponentProps<'svg'>) => {
    const clipId = useVaporId();
    return (
        <svg
            width="16"
            height="8"
            viewBox="0 0 16 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g clipPath={`url(#${clipId})`}>
                <path
                    d="M7.06543 1.17969C7.56267 0.620294 8.43733 0.620294 8.93457 1.17969L14.3301 7.25H1.66992L7.06543 1.17969Z"
                    stroke={vars.color.border.normal}
                    strokeWidth="1.5"
                />
                <path
                    d="M8.75926 1.8858C8.36016 1.42019 7.63984 1.42019 7.24074 1.8858L2 8H14L8.75926 1.8858Z"
                    fill={vars.color.background.overlay[100]}
                />
            </g>
            <defs>
                <clipPath id={clipId}>
                    <rect width="16" height="8" fill="white" />
                </clipPath>
            </defs>
        </svg>
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
