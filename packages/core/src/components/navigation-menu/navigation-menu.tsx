'use client';

import type { CSSProperties, ComponentPropsWithoutRef, ReactElement } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu';
import { useRender } from '@base-ui/react/use-render';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { useMutationObserverRef } from '~/hooks/use-mutation-observer-ref';
import { createContext } from '~/libs/create-context';
import { vars } from '~/styles/themes.css';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

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
        const { 'aria-label': ariaLabel, className, ...componentProps } = resolveStyles(props);
        const [variantProps, otherProps] = createSplitProps<NavigationMenuSharedProps>()(
            componentProps,
            ['direction', 'size', 'disabled'],
        );

        const { direction } = variantProps;

        return (
            <NavigationMenuProvider value={variantProps}>
                <BaseNavigationMenu.Root
                    ref={ref}
                    aria-label={ariaLabel}
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

export const NavigationMenuList = forwardRef<HTMLDivElement, NavigationMenuList.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { direction } = useNavigationMenuContext();

        return (
            <BaseNavigationMenu.List
                ref={ref}
                aria-orientation={undefined}
                className={clsx(styles.list({ direction }), className)}
                {...componentProps}
            />
        );
    },
);
NavigationMenuList.displayName = 'NavigationMenu.List';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Item
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuItem = forwardRef<HTMLDivElement, NavigationMenuItem.Props>(
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
            className,
            ...componentProps
        } = resolveStyles(props);
        const { size, disabled: contextDisabled } = useNavigationMenuContext();

        const disabled = disabledProp ?? contextDisabled;
        const dataAttrs = createDataAttributes({
            disabled,
            current,
        });

        return (
            <BaseNavigationMenu.Link
                ref={ref}
                href={disabled ? undefined : href}
                aria-current={current ? 'page' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                active={current}
                className={clsx(styles.link({ size }), className)}
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
            className={clsx(styles.link({ size }), styles.trigger, className)}
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
    HTMLDivElement,
    NavigationMenuTriggerIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const children = useRender({
        render: createRender(childrenProp, <ChevronDownOutlineIcon />),
    });

    return (
        <BaseNavigationMenu.Icon
            ref={ref}
            className={clsx(styles.icon, className)}
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
                className={clsx(styles.content, className)}
                {...componentProps}
            />
        );
    },
);
NavigationMenuContent.displayName = 'NavigationMenu.Content';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuPortalPrimitive = (props: NavigationMenuPortalPrimitive.Props) => {
    return <BaseNavigationMenu.Portal {...props} />;
};
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

    return (
        <BaseNavigationMenu.Positioner
            ref={ref}
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionAvoidance={{ align: 'none', ...collisionAvoidance }}
            className={clsx(styles.positioner, className)}
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

    const position = useMemo(() => getArrowPosition({ side, align }), [side, align]);

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
            className={clsx(styles.popup, className)}
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

const extractPositions = (dataset: DOMStringMap) => {
    const currentSide = dataset.side as NavigationMenuPositionerPrimitive.Props['side'];
    const currentAlign = dataset.align as NavigationMenuPositionerPrimitive.Props['align'];
    return { side: currentSide, align: currentAlign };
};

/* -----------------------------------------------------------------------------------------------*/

type ArrowPositionProps = Pick<NavigationMenuPositionerPrimitive.Props, 'side' | 'align'> & {
    offset?: number;
};

const getArrowPosition = ({
    side = 'top',
    align = 'center',
    offset = 12,
}: ArrowPositionProps): CSSProperties => {
    const positionMap = {
        'top-start': { left: offset, right: 'unset' },
        'top-end': { left: 'unset', right: offset },
        'bottom-start': { left: offset, right: 'unset' },
        'bottom-end': { left: 'unset', right: offset },
        'left-start': { top: offset, bottom: 'unset' },
        'left-end': { top: 'unset', bottom: offset },
        'right-start': { top: offset, bottom: 'unset' },
        'right-end': { top: 'unset', bottom: offset },
    };

    const key = `${side}-${align}` as keyof typeof positionMap;
    return positionMap[key] || {};
};

/* -----------------------------------------------------------------------------------------------*/

const ArrowIcon = (props: ComponentPropsWithoutRef<'svg'>) => {
    return (
        <svg
            width="16"
            height="8"
            viewBox="0 0 16 8"
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
            className={clsx(styles.viewport, className)}
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

        const popup = useRender({
            render: createRender(popupElement, <NavigationMenuPopupPrimitive />),
            props: { children: viewport },
        });

        const positioner = useRender({
            render: createRender(positionerElement, <NavigationMenuPositionerPrimitive />),
            props: { children: popup },
        });

        const portal = useRender({
            render: createRender(portalElement, <NavigationMenuPortalPrimitive />),
            props: { children: positioner },
        });

        return portal;
    },
);
NavigationMenuViewport.displayName = 'NavigationMenu.Viewport';

/* -----------------------------------------------------------------------------------------------*/

export namespace NavigationMenuRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Root>;
    export interface Props extends RootPrimitiveProps, NavigationMenuSharedProps {}

    export type Actions = BaseNavigationMenu.Root.Actions;
    export type ChangeEventDetails = BaseNavigationMenu.Root.ChangeEventDetails;
}

export namespace NavigationMenuList {
    export interface Props extends VComponentProps<typeof BaseNavigationMenu.List> {}
}

export namespace NavigationMenuItem {
    export interface Props extends VComponentProps<typeof BaseNavigationMenu.Item> {}
}

export namespace NavigationMenuLink {
    type LinkPrimitiveProps = Omit<VComponentProps<typeof BaseNavigationMenu.Link>, 'active'>;
    export interface Props extends LinkPrimitiveProps {
        current?: boolean;
        disabled?: boolean;
    }
}

export namespace NavigationMenuTriggerPrimitive {
    type TriggerPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace NavigationMenuTrigger {
    export interface Props extends NavigationMenuTriggerPrimitive.Props {}
}

export namespace NavigationMenuTriggerIndicatorPrimitive {
    type TriggerIndicatorPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Icon>;
    export interface Props extends TriggerIndicatorPrimitiveProps {}
}

export namespace NavigationMenuContent {
    type PanelPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Content>;
    export interface Props extends PanelPrimitiveProps {}
}

export namespace NavigationMenuPortalPrimitive {
    type PortalPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace NavigationMenuPositionerPrimitive {
    type PositionerPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Positioner>;
    export interface Props extends PositionerPrimitiveProps {}
}

export namespace NavigationMenuPopupPrimitive {
    type PopupPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace NavigationMenuViewportPrimitive {
    type ViewportPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Viewport>;
    export interface Props extends ViewportPrimitiveProps {}
}

export namespace NavigationMenuViewport {
    type ContentPrimitiveProps = VComponentProps<typeof NavigationMenuViewportPrimitive>;
    export interface Props extends ContentPrimitiveProps {
        portalElement?: ReactElement<NavigationMenuPortalPrimitive.Props>;
        positionerElement?: ReactElement<NavigationMenuPositionerPrimitive.Props>;
        popupElement?: ReactElement<NavigationMenuPopupPrimitive.Props>;
    }
}
