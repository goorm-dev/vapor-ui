'use client';

import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useRender } from '@base-ui/react/use-render';
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

export const DialogPopup = forwardRef<HTMLDivElement, DialogPopup.Props>(
    ({ portalElement, overlayElement, ...props }, ref) => {
        const popup = <DialogPopupPrimitive ref={ref} {...props} />;

        const overlayRender = createRender(overlayElement, <DialogOverlayPrimitive />);
        const overlay = useRender({
            render: overlayRender,
        });

        const portalRender = createRender(portalElement, <DialogPortalPrimitive />);
        const portal = useRender({
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

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseDialog.Trigger ref={ref} {...componentProps} />;
});
DialogTrigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

export const DialogClose = forwardRef<HTMLButtonElement, DialogClose.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseDialog.Close ref={ref} {...componentProps} />;
});
DialogClose.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

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

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeader.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render,
        defaultTagName: 'div',
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

export const DialogBody = forwardRef<HTMLDivElement, DialogBody.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render,
        defaultTagName: 'div',
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

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooter.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: clsx(styles.footer, className),
            ...componentProps,
        },
    });
});
DialogFooter.displayName = 'Dialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export namespace DialogRoot {
    type DialogPrimitiveProps = Omit<
        ComponentPropsWithoutRef<typeof BaseDialog.Root>,
        'disablePointerDismissal'
    >;
    export interface Props extends DialogPrimitiveProps, DialogSharedProps {
        closeOnClickOverlay?: boolean;
    }

    export type Actions = BaseDialog.Root.Actions;
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
        portalElement?: ReactElement<DialogPortalPrimitive.Props>;
        overlayElement?: ReactElement<DialogOverlayPrimitive.Props>;
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
