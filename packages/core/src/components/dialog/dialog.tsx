'use client';

import { forwardRef } from 'react';

import {
    Close as RadixClose,
    Content as RadixContent,
    Description as RadixDescription,
    Root as RadixDialog,
    Overlay as RadixOverlay,
    Portal as RadixPortal,
    Title as RadixTitle,
    Trigger as RadixTrigger,
} from '@radix-ui/react-dialog';
import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { VComponentProps } from '~/utils/types';

import * as styles from './dialog.css';
import type { DialogContentVariants } from './dialog.css';

type DialogSharedProps = DialogContentVariants & {
    closeOnClickOverlay?: boolean;
    closeOnEscape?: boolean;
};
type DialogContext = DialogSharedProps;

const [DialogRoot, useDialogContext] = createContext<DialogContext>({
    name: 'Dialog',
    hookName: 'useDialogContext',
    providerName: 'DialogProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Dialog
 * -----------------------------------------------------------------------------------------------*/

type DialogPrimitiveProps = VComponentProps<typeof RadixDialog>;
interface DialogRootProps extends DialogPrimitiveProps, DialogSharedProps {}

const Root = ({
    size,
    closeOnClickOverlay,
    closeOnEscape,
    children,
    ...props
}: DialogRootProps) => {
    return (
        <RadixDialog {...props}>
            <DialogRoot value={{ size, closeOnClickOverlay, closeOnEscape }}>{children}</DialogRoot>
        </RadixDialog>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Dialog.Portal
 * -----------------------------------------------------------------------------------------------*/

interface DialogPortalProps extends VComponentProps<typeof RadixPortal> {}

const Portal = RadixPortal;
Portal.displayName = 'Dialog.Portal';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Overlay
 * -----------------------------------------------------------------------------------------------*/

interface DialogOverlayProps extends VComponentProps<typeof RadixOverlay> {}

const Overlay = forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, ...props }, ref) => {
    return <RadixOverlay ref={ref} className={clsx(styles.overlay, className)} {...props} />;
});
Overlay.displayName = 'Dialog.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Content
 * -----------------------------------------------------------------------------------------------*/

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
interface DialogContentProps extends VComponentProps<typeof RadixContent> {}

const Content = forwardRef<HTMLDivElement, DialogContentProps>(
    ({ onPointerDownOutside, onEscapeKeyDown, className, ...props }, ref) => {
        const { size, closeOnClickOverlay = true, closeOnEscape = true } = useDialogContext();

        const handlePointerDownOutside = (event: PointerDownOutsideEvent) => {
            if (closeOnClickOverlay) return;
            event.preventDefault();
            onPointerDownOutside?.(event);
        };

        const handleEscapeKeyDown = (event: KeyboardEvent) => {
            if (closeOnEscape) return;
            event.preventDefault();
            onEscapeKeyDown?.(event);
        };

        return (
            <RadixContent
                ref={ref}
                className={clsx(styles.content({ size }), className)}
                onPointerDownOutside={handlePointerDownOutside}
                onEscapeKeyDown={handleEscapeKeyDown}
                {...props}
            />
        );
    },
);
Content.displayName = 'Dialog.Content';

/* -------------------------------------------------------------------------------------------------
 * Dialog.CombinedContent
 * -----------------------------------------------------------------------------------------------*/

interface DialogCombinedContentProps extends DialogContentProps {}

const CombinedContent = forwardRef<HTMLDivElement, DialogCombinedContentProps>((props, ref) => {
    return (
        <RadixPortal>
            <Overlay />
            <Content ref={ref} {...props} />
        </RadixPortal>
    );
});
CombinedContent.displayName = 'Dialog.CombinedContent';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface DialogTriggerProps extends VComponentProps<typeof RadixTrigger> {}

const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>((props, ref) => {
    return <RadixTrigger ref={ref} aria-controls={undefined} {...props} />;
});
Trigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

interface DialogCloseProps extends VComponentProps<typeof RadixClose> {}

const Close = forwardRef<HTMLButtonElement, DialogCloseProps>((props, ref) => {
    return <RadixClose ref={ref} {...props} />;
});
Close.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

interface DialogTitleProps extends VComponentProps<typeof RadixTitle> {}

const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, ...props }, ref) => {
    return <RadixTitle ref={ref} className={clsx(styles.title, className)} {...props} />;
});
Title.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

interface DialogDescriptionProps extends VComponentProps<typeof RadixDescription> {}

const Description = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
    ({ className, ...props }, ref) => {
        return (
            <RadixDescription
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

interface DialogHeaderProps extends VComponentProps<typeof Primitive.div> {}

const Header = forwardRef<HTMLDivElement, DialogHeaderProps>(({ className, ...props }, ref) => {
    return <Primitive.div ref={ref} className={clsx(styles.header, className)} {...props} />;
});
Header.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

interface DialogBodyProps extends VComponentProps<typeof Primitive.div> {}

const Body = forwardRef<HTMLDivElement, DialogBodyProps>(({ className, ...props }, ref) => {
    return <Primitive.div ref={ref} className={clsx(styles.body, className)} {...props} />;
});
Body.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

interface DialogFooterProps extends VComponentProps<typeof Primitive.div> {}

const Footer = forwardRef<HTMLDivElement, DialogFooterProps>(({ className, ...props }, ref) => {
    return <Primitive.div ref={ref} className={clsx(styles.footer, className)} {...props} />;
});
Footer.displayName = 'Dialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as DialogRoot,
    Portal as DialogPortal,
    Overlay as DialogOverlay,
    Content as DialogContent,
    CombinedContent as DialogCombinedContent,
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
    DialogContentProps,
    DialogCombinedContentProps,
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
    Content,
    CombinedContent,
    Portal,
    Trigger,
    Close,
    Title,
    Description,
    Header,
    Body,
    Footer,
};
