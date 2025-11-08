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
 * Dialog.Portal
 * -----------------------------------------------------------------------------------------------*/

export const DialogPortal = BaseDialog.Portal;

/* -------------------------------------------------------------------------------------------------
 * Dialog.Overlay
 * -----------------------------------------------------------------------------------------------*/

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlay.Props>(
    ({ className, ...props }, ref) => {
        return (
            <BaseDialog.Backdrop ref={ref} className={clsx(styles.overlay, className)} {...props} />
        );
    },
);
DialogOverlay.displayName = 'Dialog.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Popup
 * -----------------------------------------------------------------------------------------------*/

export const DialogPopup = forwardRef<HTMLDivElement, DialogPopup.Props>(
    ({ className, ...props }, ref) => {
        const { size } = useDialogContext();

        return (
            <BaseDialog.Popup
                ref={ref}
                className={clsx(styles.content({ size }), className)}
                {...props}
            />
        );
    },
);
DialogPopup.displayName = 'Dialog.Popup';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Content
 * -----------------------------------------------------------------------------------------------*/

export const DialogContent = forwardRef<HTMLDivElement, DialogContent.Props>(
    ({ portalProps, overlayProps, ...props }, ref) => {
        return (
            <DialogPortal {...portalProps}>
                <DialogOverlay {...overlayProps} />
                <DialogPopup ref={ref} {...props} />
            </DialogPortal>
        );
    },
);
DialogContent.displayName = 'Dialog.Content';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTrigger.Props>((props, ref) => {
    return <BaseDialog.Trigger ref={ref} aria-controls={undefined} {...props} />;
});
DialogTrigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

export const DialogClose = forwardRef<HTMLButtonElement, DialogClose.Props>((props, ref) => {
    return <BaseDialog.Close ref={ref} {...props} />;
});
DialogClose.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitle.Props>(
    ({ className, ...props }, ref) => {
        return <BaseDialog.Title ref={ref} className={clsx(styles.title, className)} {...props} />;
    },
);
DialogTitle.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescription.Props>(
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
DialogDescription.displayName = 'Dialog.Description';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Header
 * -----------------------------------------------------------------------------------------------*/

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeader.Props>(
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
DialogHeader.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

export const DialogBody = forwardRef<HTMLDivElement, DialogBody.Props>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.body, className),
                ...props,
            },
        });
    },
);
DialogBody.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooter.Props>(
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
DialogFooter.displayName = 'Dialog.Footer';

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

export namespace DialogRoot {
    type DialogPrimitiveProps = Omit<VComponentProps<typeof BaseDialog.Root>, 'dismissible'>;
    export interface Props extends DialogPrimitiveProps, DialogSharedProps {
        closeOnClickOverlay?: boolean;
    }
    export type ChangeEventDetails = BaseDialog.Root.ChangeEventDetails;
}

export namespace DialogPortal {
    export interface Props extends VComponentProps<typeof BaseDialog.Portal> {}
}

export namespace DialogOverlay {
    export interface Props extends VComponentProps<typeof BaseDialog.Backdrop> {}
}

export namespace DialogPopup {
    export interface Props extends VComponentProps<typeof BaseDialog.Popup> {}
}

export namespace DialogContent {
    export interface Props extends DialogPopup.Props {
        portalProps?: DialogPortal.Props;
        overlayProps?: DialogOverlay.Props;
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
