'use client';

import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { VComponentProps } from '~/utils/types';

import * as styles from './dialog.css';
import type { DialogContentVariants } from './dialog.css';

type DialogVariants = DialogContentVariants;
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

type DialogPrimitiveProps = Omit<VComponentProps<typeof BaseDialog.Root>, 'dismissible'>;
interface DialogRootProps extends DialogPrimitiveProps, DialogSharedProps {
    /**
     * Whether to close the dialog when clicking on the overlay
     */
    closeOnClickOverlay?: boolean;
}

/**
 * Provides a modal dialog container that overlays the main content. Renders a <div> element.
 *
 * Documentation: [Dialog Documentation](https://vapor-ui.goorm.io/docs/components/dialog)
 */
const Root = ({ size, closeOnClickOverlay, children, ...props }: DialogRootProps) => {
    return (
        <DialogProvider value={{ size }}>
            <BaseDialog.Root dismissible={closeOnClickOverlay} {...props}>
                {children}
            </BaseDialog.Root>
        </DialogProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Dialog.Portal
 * -----------------------------------------------------------------------------------------------*/

interface DialogPortalProps extends VComponentProps<typeof BaseDialog.Portal> {}

/**
 * A portal element that moves the popup to a different part of the DOM. By default, the portal element is appended to <body>.
 */
const Portal = ({ ...props }: DialogPortalProps) => {
    return <BaseDialog.Portal {...props} />;
};

Portal.displayName = 'Dialog.Portal';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Overlay
 * -----------------------------------------------------------------------------------------------*/

interface DialogOverlayProps extends VComponentProps<typeof BaseDialog.Backdrop> {}

/**
 * Displays a semi-transparent backdrop behind the dialog content. Renders a <div> element.
 */
const Overlay = forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, ...props }, ref) => {
    return <BaseDialog.Backdrop ref={ref} className={clsx(styles.overlay, className)} {...props} />;
});
Overlay.displayName = 'Dialog.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Popup
 * -----------------------------------------------------------------------------------------------*/

interface DialogPopupProps extends VComponentProps<typeof BaseDialog.Popup> {}

/**
 * Contains the main dialog content with positioning and styling. Renders a <div> element.
 */
const Popup = forwardRef<HTMLDivElement, DialogPopupProps>(({ className, ...props }, ref) => {
    const { size } = useDialogContext();

    return (
        <BaseDialog.Popup
            ref={ref}
            className={clsx(styles.content({ size }), className)}
            {...props}
        />
    );
});
Popup.displayName = 'Dialog.Popup';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Content
 * -----------------------------------------------------------------------------------------------*/

interface DialogContentProps extends DialogPopupProps {
    portalProps?: DialogPortalProps;
    overlayProps?: DialogOverlayProps;
}

/**
 * Combines Portal, Overlay, and Popup into a convenient wrapper component. Renders a <div> element.
 */
const Content = forwardRef<HTMLDivElement, DialogContentProps>(
    ({ portalProps, overlayProps, ...props }, ref) => {
        return (
            <Portal {...portalProps}>
                <Overlay {...overlayProps} />
                <Popup ref={ref} {...props} />
            </Portal>
        );
    },
);
Content.displayName = 'Dialog.Content';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface DialogTriggerProps extends VComponentProps<typeof BaseDialog.Trigger> {}

/**
 * Triggers the dialog to open when activated. Renders a <button> element.
 */
const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>((props, ref) => {
    return <BaseDialog.Trigger ref={ref} aria-controls={undefined} {...props} />;
});
Trigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

interface DialogCloseProps extends VComponentProps<typeof BaseDialog.Close> {}

/**
 * Closes the dialog when activated. Renders a <button> element.
 */
const Close = forwardRef<HTMLButtonElement, DialogCloseProps>((props, ref) => {
    return <BaseDialog.Close ref={ref} {...props} />;
});
Close.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

interface DialogTitleProps extends VComponentProps<typeof BaseDialog.Title> {}

/**
 * Displays the dialog title for accessibility and identification. Renders an <h2> element.
 */
const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, ...props }, ref) => {
    return <BaseDialog.Title ref={ref} className={clsx(styles.title, className)} {...props} />;
});
Title.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

interface DialogDescriptionProps extends VComponentProps<typeof BaseDialog.Description> {}

/**
 * Provides additional context and description for the dialog content. Renders a <p> element.
 */
const Description = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
    ({ className, ...props }, ref) => {
        return (
            <BaseDialog.Description
                ref={ref}
                className={clsx(styles.description, className)}
                {...props}
            />
        );
    },
);
Description.displayName = 'Dialog.Description';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Header
 * -----------------------------------------------------------------------------------------------*/

interface DialogHeaderProps extends VComponentProps<'div'> {}

/**
 * Contains the dialog header with title and close button. Renders a <div> element.
 */
const Header = forwardRef<HTMLDivElement, DialogHeaderProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.header, className),
                ...props,
            },
        });
    },
);
Header.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

interface DialogBodyProps extends VComponentProps<'div'> {}

/**
 * Contains the main dialog content and description. Renders a <div> element.
 */
const Body = forwardRef<HTMLDivElement, DialogBodyProps>(({ render, className, ...props }, ref) => {
    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.body, className),
            ...props,
        },
    });
});
Body.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

interface DialogFooterProps extends VComponentProps<'div'> {}

/**
 * Contains action buttons and controls at the bottom of the dialog. Renders a <div> element.
 */
const Footer = forwardRef<HTMLDivElement, DialogFooterProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.footer, className),
                ...props,
            },
        });
    },
);
Footer.displayName = 'Dialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as DialogRoot,
    Portal as DialogPortal,
    Overlay as DialogOverlay,
    Popup as DialogPopup,
    Content as DialogContent,
    Trigger as DialogTrigger,
    Close as DialogClose,
    Title as DialogTitle,
    Description as DialogDescription,
    Header as DialogHeader,
    Body as DialogBody,
    Footer as DialogFooter,
};

export type {
    DialogRootProps,
    DialogPortalProps,
    DialogOverlayProps,
    DialogPopupProps,
    DialogContentProps,
    DialogTriggerProps,
    DialogCloseProps,
    DialogTitleProps,
    DialogDescriptionProps,
    DialogHeaderProps,
    DialogBodyProps,
    DialogFooterProps,
};

export const Dialog = {
    Root,
    Overlay,
    Popup,
    Content,
    Portal,
    Trigger,
    Close,
    Title,
    Description,
    Header,
    Body,
    Footer,
};
