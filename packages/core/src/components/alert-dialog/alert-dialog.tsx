'use client';

import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './alert-dialog.css';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the AlertDialog compound component. Manages open state. Doesn't render its own HTML element.
 */
export const AlertDialogRoot = (props: AlertDialogRoot.Props) => {
    return <BaseAlertDialog.Root {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Portal container that renders alert dialog content outside the normal DOM hierarchy. Renders a `<div>` element.
 */
export const AlertDialogPortalPrimitive = forwardRef<
    HTMLDivElement,
    AlertDialogPortalPrimitive.Props
>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseAlertDialog.Portal ref={ref} {...componentProps} />;
});
AlertDialogPortalPrimitive.displayName = 'AlertDialog.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.OverlayPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Semi-transparent backdrop rendered behind the alert dialog popup. Renders a `<div>` element.
 */
export const AlertDialogOverlayPrimitive = forwardRef<
    HTMLDivElement,
    AlertDialogOverlayPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseAlertDialog.Backdrop
            ref={ref}
            className={cn(styles.overlay, className)}
            {...componentProps}
        />
    );
});
AlertDialogOverlayPrimitive.displayName = 'AlertDialog.OverlayPrimitive';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The alert dialog panel itself, centered on screen. Renders a `<div>` element.
 */
export const AlertDialogPopupPrimitive = forwardRef<
    HTMLDivElement,
    AlertDialogPopupPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseAlertDialog.Popup
            ref={ref}
            className={cn(styles.popup, className)}
            {...componentProps}
        />
    );
});
AlertDialogPopupPrimitive.displayName = 'AlertDialog.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Convenience wrapper that composes `AlertDialog.PortalPrimitive`, `AlertDialog.OverlayPrimitive`, and `AlertDialog.PopupPrimitive` into a single element. Use `portalElement` or `overlayElement` to replace individual parts. Renders a `<div>` element.
 */
export const AlertDialogPopup = forwardRef<HTMLDivElement, AlertDialogPopup.Props>(
    ({ portalElement, overlayElement, ...props }, ref) => {
        const popup = <AlertDialogPopupPrimitive ref={ref} {...props} />;

        const overlayRender = createRender(overlayElement, <AlertDialogOverlayPrimitive />);
        const overlay = useRenderElement({
            render: overlayRender,
        });

        const portalRender = createRender(portalElement, <AlertDialogPortalPrimitive />);
        const portal = useRenderElement({
            render: portalRender,
            props: {
                children: (
                    <>
                        {overlay}
                        {popup}
                    </>
                ),
            },
        });

        return portal;
    },
);
AlertDialogPopup.displayName = 'AlertDialog.Popup';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that opens the alert dialog when activated. Renders a `<button>` element.
 */
export const AlertDialogTrigger = forwardRef<HTMLButtonElement, AlertDialogTrigger.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BaseAlertDialog.Trigger ref={ref} {...componentProps} />;
    },
);
AlertDialogTrigger.displayName = 'AlertDialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.Close
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that closes the alert dialog when activated. Renders a `<button>` element.
 */
export const AlertDialogClose = forwardRef<HTMLButtonElement, AlertDialogClose.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BaseAlertDialog.Close ref={ref} {...componentProps} />;
    },
);
AlertDialogClose.displayName = 'AlertDialog.Close';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.Title
 * -----------------------------------------------------------------------------------------------*/

/**
 * Heading element that labels the alert dialog for assistive technologies. Renders an `<h2>` element.
 */
export const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitle.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseAlertDialog.Title
                ref={ref}
                className={cn(styles.title, className)}
                {...componentProps}
            />
        );
    },
);
AlertDialogTitle.displayName = 'AlertDialog.Title';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * Paragraph that provides supplementary text for the alert dialog, linked to the alert dialog panel for assistive technologies. Renders a `<p>` element.
 */
export const AlertDialogDescription = forwardRef<
    HTMLParagraphElement,
    AlertDialogDescription.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseAlertDialog.Description
            ref={ref}
            className={cn(styles.description, className)}
            {...componentProps}
        />
    );
});
AlertDialogDescription.displayName = 'AlertDialog.Description';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * Scrollable main content area of the alert dialog. Renders a `<div>` element.
 */
export const AlertDialogBody = forwardRef<HTMLDivElement, AlertDialogBody.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.body, className),
            ...componentProps,
        },
    });
});
AlertDialogBody.displayName = 'AlertDialog.Body';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * Bottom section of the alert dialog, typically containing action buttons. Renders a `<div>` element.
 */
export const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooter.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'div',
            props: {
                className: cn(styles.footer, className),
                ...componentProps,
            },
        });
    },
);
AlertDialogFooter.displayName = 'AlertDialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export interface AlertDialogRootProps extends BaseAlertDialog.Root.Props {}

export namespace AlertDialogRoot {
    export type State = BaseAlertDialog.Root.State;
    export type Props = AlertDialogRootProps;

    export type Actions = BaseAlertDialog.Root.Actions;
    export type ChangeEventDetails = BaseAlertDialog.Root.ChangeEventDetails;
}

export namespace AlertDialogPortalPrimitive {
    export type State = BaseAlertDialog.Portal.State;
    export type Props = VaporUIComponentProps<typeof BaseAlertDialog.Portal, State>;
}

export namespace AlertDialogOverlayPrimitive {
    export type State = BaseAlertDialog.Backdrop.State;
    export type Props = VaporUIComponentProps<typeof BaseAlertDialog.Backdrop, State>;
}

export namespace AlertDialogPopupPrimitive {
    export type State = BaseAlertDialog.Popup.State;
    export type Props = VaporUIComponentProps<typeof BaseAlertDialog.Popup, State>;
}

export interface AlertDialogPopupProps extends AlertDialogPopupPrimitive.Props {
    /**
     * Replaces the default `AlertDialog.PortalPrimitive`. Use to customise portal container behavior.
     */
    portalElement?: ReactElement<AlertDialogPortalPrimitive.Props>;
    /**
     * Replaces the default `AlertDialog.OverlayPrimitive`. Use to customise backdrop appearance or behavior.
     */
    overlayElement?: ReactElement<AlertDialogOverlayPrimitive.Props>;
}

export namespace AlertDialogPopup {
    export type State = AlertDialogPopupPrimitive.State;
    export type Props = AlertDialogPopupProps;
}

export namespace AlertDialogTrigger {
    export type State = BaseAlertDialog.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BaseAlertDialog.Trigger, State>;
}

export namespace AlertDialogClose {
    export type State = BaseAlertDialog.Close.State;
    export type Props = VaporUIComponentProps<typeof BaseAlertDialog.Close, State>;
}

export namespace AlertDialogTitle {
    export type State = BaseAlertDialog.Title.State;
    export type Props = VaporUIComponentProps<typeof BaseAlertDialog.Title, State>;
}

export namespace AlertDialogDescription {
    export type State = BaseAlertDialog.Description.State;
    export type Props = VaporUIComponentProps<typeof BaseAlertDialog.Description, State>;
}

export namespace AlertDialogBody {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}

export namespace AlertDialogFooter {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}
