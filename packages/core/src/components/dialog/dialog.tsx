'use client';

import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './dialog.css';
import type { DialogPopupVariants } from './dialog.css';

type DialogVariants = DialogPopupVariants;
type DialogSharedProps = DialogVariants;

type DialogContext = DialogSharedProps;

const [DialogProvider, useDialogContext] = createContext<DialogContext>({
    name: 'Dialog',
    hookName: 'useDialogContext',
    providerName: 'DialogProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Dialog
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root component of Dialog that manages open/close state and settings. Renders a `<div>` element.
 */
export const DialogRoot = ({ size, closeOnClickOverlay, children, ...props }: DialogRoot.Props) => {
    return (
        <DialogProvider value={{ size }}>
            <BaseDialog.Root dismissible={closeOnClickOverlay} {...props}>
                {children}
            </BaseDialog.Root>
        </DialogProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Dialog.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const DialogPortalPrimitive = BaseDialog.Portal;

/* -------------------------------------------------------------------------------------------------
 * Dialog.OverlayPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Background overlay for Dialog. Renders a `<div>` element.
 */
export const DialogOverlayPrimitive = forwardRef<HTMLDivElement, DialogOverlayPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseDialog.Backdrop
                ref={ref}
                className={clsx(styles.overlay, className)}
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
 * Popup container for Dialog content. Renders a `<div>` element.
 */
export const DialogPopupPrimitive = forwardRef<HTMLDivElement, DialogPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { size } = useDialogContext();

        return (
            <BaseDialog.Popup
                ref={ref}
                className={clsx(styles.popup({ size }), className)}
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
 * Composed Dialog popup with portal and overlay. Renders a `<div>` element.
 */
export const DialogPopup = forwardRef<HTMLDivElement, DialogPopup.Props>(
    ({ portalElement, overlayElement, ...props }, ref) => {
        const popup = <DialogPopupPrimitive ref={ref} {...props} />;

        const overlay = useRender({
            render: createRender(overlayElement ?? <DialogOverlayPrimitive />),
        });

        const portal = useRender({
            render: createRender(portalElement, <DialogPortalPrimitive />),
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
 * Button that triggers the Dialog to open. Renders a `<button>` element.
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
 * Button that closes the Dialog. Renders a `<button>` element.
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
 * Title heading for Dialog. Renders an `<h2>` element.
 */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitle.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseDialog.Title ref={ref} className={clsx(styles.title, className)} {...componentProps} />
    );
});
DialogTitle.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * Description text for Dialog. Renders a `<p>` element.
 */
export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescription.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseDialog.Description
                ref={ref}
                className={clsx(styles.description, className)}
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
 * Header section for Dialog. Renders a `<div>` element.
 */
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeader.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.header, className),
            ...componentProps,
        },
    });
});
DialogHeader.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * Body section for Dialog content. Renders a `<div>` element.
 */
export const DialogBody = forwardRef<HTMLDivElement, DialogBody.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.body, className),
            ...componentProps,
        },
    });
});
DialogBody.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * Footer section for Dialog actions. Renders a `<div>` element.
 */
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooter.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.footer, className),
            ...componentProps,
        },
    });
});
DialogFooter.displayName = 'Dialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export namespace DialogRoot {
    type DialogPrimitiveProps = Omit<VComponentProps<typeof BaseDialog.Root>, 'dismissible'>;
    export interface Props extends DialogPrimitiveProps, DialogSharedProps {
        /**
         * Whether to close the Dialog when clicking on the overlay.
         * @default true
         */
        closeOnClickOverlay?: boolean;
    }
    export type ChangeEventDetails = BaseDialog.Root.ChangeEventDetails;
}

export namespace DialogPortalPrimitive {
    export interface Props extends VComponentProps<typeof BaseDialog.Portal> {}
}

export namespace DialogOverlayPrimitive {
    export interface Props extends VComponentProps<typeof BaseDialog.Backdrop> {}
}

export namespace DialogPopupPrimitive {
    export interface Props extends VComponentProps<typeof BaseDialog.Popup> {}
}

export namespace DialogPopup {
    export interface Props extends DialogPopupPrimitive.Props {
        /**
         * Custom portal element to replace the default portal.
         */
        portalElement?: ReactElement<typeof DialogPortalPrimitive>;
        /**
         * Custom overlay element to replace the default overlay.
         */
        overlayElement?: ReactElement<typeof DialogOverlayPrimitive>;
    }
}

export namespace DialogTrigger {
    export interface Props extends VComponentProps<typeof BaseDialog.Trigger> {}
}

export namespace DialogClose {
    export interface Props extends VComponentProps<typeof BaseDialog.Close> {}
}

export namespace DialogTitle {
    export interface Props extends VComponentProps<typeof BaseDialog.Title> {}
}

export namespace DialogDescription {
    export interface Props extends VComponentProps<typeof BaseDialog.Description> {}
}

export namespace DialogHeader {
    export interface Props extends VComponentProps<'div'> {}
}

export namespace DialogBody {
    export interface Props extends VComponentProps<'div'> {}
}

export namespace DialogFooter {
    export interface Props extends VComponentProps<'div'> {}
}
