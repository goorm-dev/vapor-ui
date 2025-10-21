'use client';

import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { NavigationMenu as BaseNavigationMenu } from '@base-ui-components/react';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { useMutationObserver } from '~/hooks/use-mutation-observer';
import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { vars } from '~/styles/vars.css';
import { composeRefs } from '~/utils/compose-refs';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import type { VComponentProps } from '~/utils/types';

import type { ItemVariants, LinkVariants, ListVariants } from './navigation-menu.css';
import * as styles from './navigation-menu.css';

type NavigationMenuVariants = ListVariants & ItemVariants & LinkVariants;
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
    ({ 'aria-label': ariaLabel, className, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<NavigationMenuSharedProps>()(props, [
            'direction',
            'size',
            'stretch',
            'disabled',
        ]);

        const { direction } = variantProps;

        return (
            <NavigationMenuProvider value={variantProps}>
                <BaseNavigationMenu.Root
                    ref={ref}
                    aria-label={ariaLabel}
                    orientation={direction}
                    className={clsx(styles.root({ stretch: variantProps.stretch }), className)}
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
    ({ className, ...props }, ref) => {
        const { direction } = useNavigationMenuContext();

        return (
            <BaseNavigationMenu.List
                ref={ref}
                aria-orientation={undefined}
                className={clsx(styles.list({ direction }), className)}
                {...props}
            />
        );
    },
);
NavigationMenuList.displayName = 'NavigationMenu.List';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Item
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuItem = forwardRef<HTMLDivElement, NavigationMenuItem.Props>(
    ({ className, ...props }, ref) => {
        const { stretch } = useNavigationMenuContext();

        return (
            <BaseNavigationMenu.Item
                ref={ref}
                className={clsx(styles.item({ stretch }), className)}
                {...props}
            />
        );
    },
);
NavigationMenuItem.displayName = 'NavigationMenu.Item';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Link
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLink.Props>(
    ({ selected, href, disabled: disabledProp, className, ...props }, ref) => {
        const { size, disabled: contextDisabled } = useNavigationMenuContext();

        const disabled = disabledProp ?? contextDisabled;
        const dataAttrs = createDataAttributes({
            selected,
            disabled,
        });

        return (
            <BaseNavigationMenu.Link
                ref={ref}
                href={disabled ? undefined : href}
                aria-current={selected ? 'page' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                className={clsx(styles.link({ size }), className)}
                {...dataAttrs}
                {...props}
            />
        );
    },
);
NavigationMenuLink.displayName = 'NavigationMenu.Link';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.LinkItem
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuLinkItem = forwardRef<HTMLAnchorElement, NavigationMenuLinkItem.Props>(
    (props, ref) => {
        return (
            <NavigationMenuItem>
                <NavigationMenuLink ref={ref} {...props} />
            </NavigationMenuItem>
        );
    },
);
NavigationMenuLinkItem.displayName = 'NavigationMenu.LinkItem';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTrigger.Props>(
    ({ disabled: disabledProp, className, ...props }, ref) => {
        const { size, disabled: contextDisabled } = useNavigationMenuContext();

        const disabled = disabledProp ?? contextDisabled;
        const dataAttrs = createDataAttributes({ disabled });

        return (
            <BaseNavigationMenu.Trigger
                ref={ref}
                disabled={disabled}
                className={clsx(styles.link({ size }), styles.trigger, className)}
                {...dataAttrs}
                {...props}
            />
        );
    },
);
NavigationMenuTrigger.displayName = 'NavigationMenu.Trigger';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.TriggerIndicator
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuTriggerIndicator = forwardRef<
    HTMLDivElement,
    NavigationMenuTriggerIndicator.Props
>(({ className, children, ...props }, ref) => {
    const IconElement = createSlot(children || <ChevronDownOutlineIcon />);

    return (
        <BaseNavigationMenu.Icon ref={ref} className={clsx(styles.icon, className)} {...props}>
            <IconElement />
        </BaseNavigationMenu.Icon>
    );
});
NavigationMenuTriggerIndicator.displayName = 'NavigationMenu.TriggerIndicator';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Panel
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuPanel = forwardRef<HTMLDivElement, NavigationMenuPanel.Props>(
    ({ className, ...props }, ref) => {
        return (
            <BaseNavigationMenu.Content
                ref={ref}
                className={clsx(styles.panel, className)}
                {...props}
            />
        );
    },
);
NavigationMenuPanel.displayName = 'NavigationMenu.Panel';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Portal
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuPortal = (props: NavigationMenuPortal.Props) => {
    return <BaseNavigationMenu.Portal {...props} />;
};
NavigationMenuPortal.displayName = 'NavigationMenu.Portal';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Positioner
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuPositioner = forwardRef<HTMLDivElement, NavigationMenuPositioner.Props>(
    (
        {
            side = 'bottom',
            align = 'center',
            sideOffset = 8,
            collisionAvoidance,
            className,
            ...props
        },
        ref,
    ) => {
        return (
            <BaseNavigationMenu.Positioner
                ref={ref}
                side={side}
                align={align}
                sideOffset={sideOffset}
                collisionAvoidance={{ align: 'none', ...collisionAvoidance }}
                className={clsx(styles.positioner, className)}
                {...props}
            />
        );
    },
);
NavigationMenuPositioner.displayName = 'NavigationMenu.Positioner';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Popup
 * -----------------------------------------------------------------------------------------------*/

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

export const NavigationMenuPopup = forwardRef<HTMLElement, NavigationMenuPopup.Props>(
    ({ className, children, ...props }, ref) => {
        const [side, setSide] = useState<NavigationMenuPositioner.Props['side']>();
        const [align, setAlign] = useState<NavigationMenuPositioner.Props['align']>();

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

        const arrowRef = useMutationObserver<HTMLDivElement>({
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
                {...props}
            >
                <BaseNavigationMenu.Arrow ref={arrowRef} style={position} className={styles.arrow}>
                    <ArrowIcon />
                </BaseNavigationMenu.Arrow>

                {children}
            </BaseNavigationMenu.Popup>
        );
    },
);
NavigationMenuPopup.displayName = 'NavigationMenu.Popup';

const extractPositions = (dataset: DOMStringMap) => {
    const currentSide = dataset.side as NavigationMenuPositioner.Props['side'];
    const currentAlign = dataset.align as NavigationMenuPositioner.Props['align'];
    return { side: currentSide, align: currentAlign };
};

/* -----------------------------------------------------------------------------------------------*/

type ArrowPositionProps = Pick<NavigationMenuPositioner.Props, 'side' | 'align'> & {
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
 * NavigationMenu.Viewport
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuViewport = forwardRef<HTMLDivElement, NavigationMenuViewport.Props>(
    ({ className, ...props }, ref) => {
        return (
            <BaseNavigationMenu.Viewport
                ref={ref}
                className={clsx(styles.viewport, className)}
                {...props}
            />
        );
    },
);
NavigationMenuViewport.displayName = 'NavigationMenu.Viewport';

/* -------------------------------------------------------------------------------------------------
 * NavigationMenu.Content
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContent.Props>(
    ({ portalProps, positionerProps, popupProps, className, ...props }, ref) => {
        return (
            <NavigationMenuPortal {...portalProps}>
                <NavigationMenuPositioner {...positionerProps}>
                    <NavigationMenuPopup {...popupProps}>
                        <NavigationMenuViewport ref={ref} {...props} />
                    </NavigationMenuPopup>
                </NavigationMenuPositioner>
            </NavigationMenuPortal>
        );
    },
);
NavigationMenuContent.displayName = 'NavigationMenu.Content';

/* -----------------------------------------------------------------------------------------------*/

export namespace NavigationMenuRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Root>;

    export interface Props extends RootPrimitiveProps, NavigationMenuSharedProps {
        'aria-label': string;
    }
    export type ValueChangeEvent = BaseNavigationMenu.Root.ChangeEventDetails;
}

export namespace NavigationMenuList {
    type ListPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.List>;
    export interface Props extends ListPrimitiveProps {}
}

export namespace NavigationMenuItem {
    type ItemPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Item>;
    export interface Props extends ItemPrimitiveProps {}
}

export namespace NavigationMenuLink {
    type LinkPrimitiveProps = Omit<VComponentProps<typeof BaseNavigationMenu.Link>, 'active'>;
    export interface Props extends LinkPrimitiveProps {
        selected?: boolean;
        disabled?: boolean;
    }
}

export namespace NavigationMenuLinkItem {
    export interface Props extends VComponentProps<typeof NavigationMenuLink> {}
}

export namespace NavigationMenuTrigger {
    type TriggerPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace NavigationMenuTriggerIndicator {
    type TriggerIndicatorPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Icon>;
    export interface Props extends TriggerIndicatorPrimitiveProps {}
}

export namespace NavigationMenuPanel {
    type PanelPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Content>;
    export interface Props extends PanelPrimitiveProps {}
}

export namespace NavigationMenuPortal {
    type PortalPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace NavigationMenuPositioner {
    type PositionerPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Positioner>;
    export interface Props extends PositionerPrimitiveProps {}
}

export namespace NavigationMenuPopup {
    type PopupPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace NavigationMenuViewport {
    type ViewportPrimitiveProps = VComponentProps<typeof BaseNavigationMenu.Viewport>;
    export interface Props extends ViewportPrimitiveProps {}
}

export namespace NavigationMenuContent {
    type ContentPrimitiveProps = VComponentProps<typeof NavigationMenuViewport>;
    export interface Props extends ContentPrimitiveProps {
        portalProps?: NavigationMenuPortal.Props;
        positionerProps?: NavigationMenuPositioner.Props;
        popupProps?: NavigationMenuPopup.Props;
    }
}
