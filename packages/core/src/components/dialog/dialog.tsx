'use client';

import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
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

interface DialogRootProps
    extends DialogVariants, Omit<BaseDialog.Root.Props, 'disablePointerDismissal'> {
    /**
     * Determines whether the dialog should close on outside clicks.
     * @default false
     */
    closeOnClickOverlay?: boolean;
}

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

interface DialogPopupProps extends DialogPopupPrimitive.Props {
    /**
     * A Custom element for Dialog.PortalPrimitive. If not provided, the default Dialog.PortalPrimitive will be rendered.
     */
    portalElement?: ReactElement<DialogPortalPrimitive.Props>;
    /**
     * A Custom element for Dialog.OverlayPrimitive. If not provided, the default Dialog.OverlayPrimitive will be rendered.
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
