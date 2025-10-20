'use client';

import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { resolveStyles } from '~/utils/resolve-styles';
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
    closeOnClickOverlay?: boolean;
}

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

const Portal = BaseDialog.Portal;

/* -------------------------------------------------------------------------------------------------
 * Dialog.Overlay
 * -----------------------------------------------------------------------------------------------*/

interface DialogOverlayProps extends VComponentProps<typeof BaseDialog.Backdrop> {}

const Overlay = forwardRef<HTMLDivElement, DialogOverlayProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseDialog.Backdrop
            ref={ref}
            className={clsx(styles.overlay, className)}
            {...componentProps}
        />
    );
});
Overlay.displayName = 'Dialog.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Popup
 * -----------------------------------------------------------------------------------------------*/

interface DialogPopupProps extends VComponentProps<typeof BaseDialog.Popup> {}

const Popup = forwardRef<HTMLDivElement, DialogPopupProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { size } = useDialogContext();

    return (
        <BaseDialog.Popup
            ref={ref}
            className={clsx(styles.content({ size }), className)}
            {...componentProps}
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

const Content = forwardRef<HTMLDivElement, DialogContentProps>((props, ref) => {
    const { portalProps, overlayProps, ...componentProps } = resolveStyles(props);

    return (
        <Portal {...portalProps}>
            <Overlay {...overlayProps} />
            <Popup ref={ref} {...componentProps} />
        </Portal>
    );
});
Content.displayName = 'Dialog.Content';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface DialogTriggerProps extends VComponentProps<typeof BaseDialog.Trigger> {}

const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseDialog.Trigger ref={ref} {...componentProps} />;
});
Trigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

interface DialogCloseProps extends VComponentProps<typeof BaseDialog.Close> {}

const Close = forwardRef<HTMLButtonElement, DialogCloseProps>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseDialog.Close ref={ref} {...componentProps} />;
});
Close.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

interface DialogTitleProps extends VComponentProps<typeof BaseDialog.Title> {}

const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseDialog.Title ref={ref} className={clsx(styles.title, className)} {...componentProps} />
    );
});
Title.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

interface DialogDescriptionProps extends VComponentProps<typeof BaseDialog.Description> {}

const Description = forwardRef<HTMLParagraphElement, DialogDescriptionProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseDialog.Description
            ref={ref}
            className={clsx(styles.description, className)}
            {...componentProps}
        />
    );
});
Description.displayName = 'Dialog.Description';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Header
 * -----------------------------------------------------------------------------------------------*/

interface DialogHeaderProps extends VComponentProps<'div'> {}

const Header = forwardRef<HTMLDivElement, DialogHeaderProps>((props, ref) => {
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
Header.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

interface DialogBodyProps extends VComponentProps<'div'> {}

const Body = forwardRef<HTMLDivElement, DialogBodyProps>((props, ref) => {
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
Body.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

interface DialogFooterProps extends VComponentProps<'div'> {}

const Footer = forwardRef<HTMLDivElement, DialogFooterProps>((props, ref) => {
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
