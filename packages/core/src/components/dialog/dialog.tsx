'use client';

import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './dialog.css';
import type { DialogPopupVariants } from './dialog.css';

type DialogVariants = DialogPopupVariants;
type DialogContext = DialogVariants;

const [DialogProvider, useDialogContext] = createContext<DialogContext>({
    name: 'Dialog',
    hookName: 'useDialogContext',
    providerName: 'DialogProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Dialog
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Dialog compound component. Manages open state and provides size context to sub-parts. Doesn't render its own HTML element.
 */
export const DialogRoot = ({
    size,
    closeOnClickOverlay = true,
    children,
    ...props
}: DialogRoot.Props) => {
    return (
        <DialogProvider value={{ size }}>
            <BaseDialog.Root disablePointerDismissal={!closeOnClickOverlay} {...props}>
                {children}
            </BaseDialog.Root>
        </DialogProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Dialog.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Portal container that renders dialog content outside the normal DOM hierarchy. Renders a `<div>` element.
 */
export const DialogPortalPrimitive = forwardRef<HTMLDivElement, DialogPortalPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <BaseDialog.Portal ref={ref} {...componentProps} />;
    },
);
DialogPortalPrimitive.displayName = 'Dialog.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Dialog.OverlayPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Semi-transparent backdrop rendered behind the dialog popup. Renders a `<div>` element.
 */
export const DialogOverlayPrimitive = forwardRef<HTMLDivElement, DialogOverlayPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseDialog.Backdrop
                ref={ref}
                className={cn(styles.overlay, className)}
                {...componentProps}
            />
        );
    },
);
DialogOverlayPrimitive.displayName = 'Dialog.OverlayPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Dialog.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * The dialog panel itself, centered on screen. Size is controlled by the `size` prop on `Dialog.Root`. Renders a `<div>` element.
 */
export const DialogPopupPrimitive = forwardRef<HTMLDivElement, DialogPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { size } = useDialogContext();

        return (
            <BaseDialog.Popup
                ref={ref}
                className={cn(styles.popup({ size }), className)}
                {...componentProps}
            />
        );
    },
);
DialogPopupPrimitive.displayName = 'Dialog.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Convenience wrapper that composes `Dialog.PortalPrimitive`, `Dialog.OverlayPrimitive`, and `Dialog.PopupPrimitive` into a single element. Use `portalElement` or `overlayElement` to replace individual parts. Renders a `<div>` element.
 */
export const DialogPopup = forwardRef<HTMLDivElement, DialogPopup.Props>(
    ({ portalElement, overlayElement, ...props }, ref) => {
        const popup = <DialogPopupPrimitive ref={ref} {...props} />;

        const overlayRender = createRender(overlayElement, <DialogOverlayPrimitive />);
        const overlay = useRenderElement({
            render: overlayRender,
        });

        const portalRender = createRender(portalElement, <DialogPortalPrimitive />);
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
DialogPopup.displayName = 'Dialog.Popup';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that opens the dialog when activated. Renders a `<button>` element.
 */
export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseDialog.Trigger ref={ref} {...componentProps} />;
});
DialogTrigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that closes the dialog when activated. Renders a `<button>` element.
 */
export const DialogClose = forwardRef<HTMLButtonElement, DialogClose.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseDialog.Close ref={ref} {...componentProps} />;
});
DialogClose.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

/**
 * Heading element that labels the dialog for assistive technologies. Renders an `<h2>` element.
 */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitle.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseDialog.Title ref={ref} className={cn(styles.title, className)} {...componentProps} />
    );
});
DialogTitle.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * Paragraph that provides supplementary text for the dialog, linked to the dialog panel for assistive technologies. Renders a `<p>` element.
 */
export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescription.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseDialog.Description
                ref={ref}
                className={cn(styles.description, className)}
                {...componentProps}
            />
        );
    },
);
DialogDescription.displayName = 'Dialog.Description';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Header
 * -----------------------------------------------------------------------------------------------*/

/**
 * Top section of the dialog, typically containing the title and a close button. Renders a `<div>` element.
 */
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeader.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.header, className),
            ...componentProps,
        },
    });
});
DialogHeader.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * Scrollable main content area of the dialog. Renders a `<div>` element.
 */
export const DialogBody = forwardRef<HTMLDivElement, DialogBody.Props>((props, ref) => {
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
DialogBody.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * Bottom section of the dialog, typically containing action buttons. Renders a `<div>` element.
 */
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooter.Props>((props, ref) => {
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
});
DialogFooter.displayName = 'Dialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export interface DialogRootProps
    extends DialogVariants, Omit<BaseDialog.Root.Props, 'disablePointerDismissal'> {
    /**
     * When `true`, clicking the overlay closes the dialog. Default: `true`
     */
    closeOnClickOverlay?: boolean;
}

/**
 * @forwardedProps {DialogPopupPrimitive} size
 */
export namespace DialogRoot {
    export type State = {};
    export type Props = DialogRootProps;

    export type Actions = BaseDialog.Root.Actions;
    export type ChangeEventDetails = BaseDialog.Root.ChangeEventDetails;
}

export namespace DialogPortalPrimitive {
    export type State = BaseDialog.Portal.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Portal, State>;
}

export namespace DialogOverlayPrimitive {
    export type State = BaseDialog.Backdrop.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Backdrop, State>;
}

export namespace DialogPopupPrimitive {
    export type State = BaseDialog.Popup.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Popup, State>;
}

export interface DialogPopupProps extends DialogPopupPrimitive.Props {
    /**
     * Replaces the default `Dialog.PortalPrimitive`. Use to customise portal container behavior.
     */
    portalElement?: ReactElement<DialogPortalPrimitive.Props>;
    /**
     * Replaces the default `Dialog.OverlayPrimitive`. Use to customise backdrop appearance or behavior.
     */
    overlayElement?: ReactElement<DialogOverlayPrimitive.Props>;
}

export namespace DialogPopup {
    export type State = DialogPopupPrimitive.State;
    export type Props = DialogPopupProps;
}

export namespace DialogTrigger {
    export type State = BaseDialog.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Trigger, State>;
}

export namespace DialogClose {
    export type State = BaseDialog.Close.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Close, State>;
}

export namespace DialogTitle {
    export type State = BaseDialog.Title.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Title, State>;
}

export namespace DialogDescription {
    export type State = BaseDialog.Description.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Description, State>;
}

export namespace DialogHeader {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}

export namespace DialogBody {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}

export namespace DialogFooter {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}
