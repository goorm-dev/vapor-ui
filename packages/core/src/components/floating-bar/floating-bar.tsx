import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { Popover } from '@base-ui/react/popover';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './floating-bar.css';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the FloatingBar compound component, a bar that floats at the bottom center of the viewport to show contextual actions. Manages the open state. Doesn't render its own HTML element.
 */
export const FloatingBarRoot = (props: FloatingBarRoot.Props) => {
    return <Popover.Root {...props} />;
};
FloatingBarRoot.displayName = 'FloatingBar.Root';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that opens the floating bar when clicked. Renders a `<button>` element.
 */
export const FloatingBarTrigger = forwardRef<HTMLButtonElement, FloatingBarTrigger.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <Popover.Trigger ref={ref} {...componentProps} />;
    },
);
FloatingBarTrigger.displayName = 'FloatingBar.Trigger';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.Close
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that closes the floating bar when clicked. Renders a `<button>` element.
 */
export const FloatingBarClose = forwardRef<HTMLButtonElement, FloatingBarClose.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <Popover.Close ref={ref} {...componentProps} />;
    },
);
FloatingBarClose.displayName = 'FloatingBar.Close';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Portal container that renders the floating bar outside the normal DOM hierarchy. Renders a `<div>` element.
 */
export const FloatingBarPortalPrimitive = forwardRef<
    HTMLDivElement,
    FloatingBarPortalPrimitive.Props
>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <Popover.Portal ref={ref} {...componentProps} />;
});
FloatingBarPortalPrimitive.displayName = 'FloatingBar.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Fixed position styles for the FloatingBar
 */
const positions = { top: 'initial', opacity: 1, left: '50%', transform: 'translateX(-50%)' };

/**
 * Fixes the floating bar to the bottom center of the viewport, above the safe area. Renders a `<div>` element.
 */
export const FloatingBarPositionerPrimitive = forwardRef<
    HTMLDivElement,
    FloatingBarPositionerPrimitive.Props
>((props, ref) => {
    const { style, className, ...componentProps } = resolveStyles(props);

    return (
        <Popover.Positioner
            ref={ref}
            positionMethod="fixed"
            style={{ ...positions, ...style }}
            className={cn(styles.positioner, className)}
            {...componentProps}
        />
    );
});
FloatingBarPositionerPrimitive.displayName = 'FloatingBar.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The floating bar panel that holds the actions, sliding up from the bottom as it opens. Renders a `<div>` element.
 */
export const FloatingBarPopupPrimitive = forwardRef<
    HTMLDivElement,
    FloatingBarPopupPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <Popover.Popup ref={ref} className={cn(styles.popup, className)} {...componentProps} />;
});
FloatingBarPopupPrimitive.displayName = 'FloatingBar.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * FloatingBar.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `FloatingBar.PortalPrimitive`, `FloatingBar.PositionerPrimitive`, and `FloatingBar.PopupPrimitive` into a single part. Use `portalElement` to replace the portal. Renders a `<div>` element.
 */
export const FloatingBarPopup = forwardRef<HTMLDivElement, FloatingBarPopup.Props>((props, ref) => {
    const { portalElement, ...componentProps } = props;

    const popup = <FloatingBarPopupPrimitive ref={ref} {...componentProps} />;

    const positionerRender = createRender(<FloatingBarPositionerPrimitive />);
    const positioner = useRenderElement({
        render: positionerRender,
        props: { children: popup },
    });

    const portalRender = createRender(portalElement, <FloatingBarPortalPrimitive />);
    const portal = useRenderElement({
        render: portalRender,
        props: { children: positioner },
    });

    return portal;
});
FloatingBarPopup.displayName = 'FloatingBar.Popup';

/* -----------------------------------------------------------------------------------------------*/

export namespace FloatingBarRoot {
    export type State = Popover.Root.State;
    export type Props = Popover.Root.Props;
    export type Actions = Popover.Root.Actions;
    export type ChangeEventDetails = Popover.Root.ChangeEventDetails;
}

export namespace FloatingBarTrigger {
    export type State = Popover.Trigger.State;
    export type Props = VaporUIComponentProps<typeof Popover.Trigger, State>;
}

export namespace FloatingBarClose {
    export type State = Popover.Close.State;
    export type Props = VaporUIComponentProps<typeof Popover.Close, State>;
}

export namespace FloatingBarPortalPrimitive {
    export type State = Popover.Portal.State;
    export type Props = VaporUIComponentProps<typeof Popover.Portal, State>;
}

export namespace FloatingBarPositionerPrimitive {
    export type State = Popover.Positioner.State;
    export type Props = VaporUIComponentProps<typeof Popover.Positioner, State>;
}

export namespace FloatingBarPopupPrimitive {
    export type State = Popover.Popup.State;
    export type Props = VaporUIComponentProps<typeof Popover.Popup, State>;
}

export interface FloatingBarPopupProps extends FloatingBarPopupPrimitive.Props {
    /**
     * Replaces the default `FloatingBar.PortalPrimitive`. Use to change the portal container.
     */
    portalElement?: ReactElement<FloatingBarPortalPrimitive.Props>;
}

export namespace FloatingBarPopup {
    export type State = Popover.Popup.State;
    export type Props = FloatingBarPopupProps;
}
