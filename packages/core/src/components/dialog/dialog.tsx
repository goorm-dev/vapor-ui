import type { ComponentPropsWithoutRef } from 'react';
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
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { type VaporComponentProps, splitLayoutProps, vapor } from '~/libs/factory';
import { sprinkles } from '~/styles/sprinkles.css';

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

type DialogPrimitiveProps = ComponentPropsWithoutRef<typeof RadixDialog>;
type DialogRootProps = DialogPrimitiveProps & DialogSharedProps;

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

type DialogPortalProps = ComponentPropsWithoutRef<typeof RadixPortal>;

const Portal = RadixPortal;
Portal.displayName = 'Dialog.Portal';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Overlay
 * -----------------------------------------------------------------------------------------------*/

type DialogOverlayProps = VaporComponentProps<typeof RadixOverlay>;

const Overlay = forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <RadixOverlay
            ref={ref}
            className={clsx(styles.overlay, sprinkles(layoutProps), className)}
            {...otherProps}
        />
    );
});
Overlay.displayName = 'Dialog.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Content
 * -----------------------------------------------------------------------------------------------*/

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type DialogContentProps = VaporComponentProps<typeof RadixContent>;

const Content = forwardRef<HTMLDivElement, DialogContentProps>(
    ({ onPointerDownOutside, onEscapeKeyDown, className, ...props }, ref) => {
        const { size, closeOnClickOverlay = true, closeOnEscape = true } = useDialogContext();
        const [layoutProps, otherProps] = splitLayoutProps(props);

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
                className={clsx(styles.content({ size }), sprinkles(layoutProps), className)}
                onPointerDownOutside={handlePointerDownOutside}
                onEscapeKeyDown={handleEscapeKeyDown}
                {...otherProps}
            />
        );
    },
);
Content.displayName = 'Dialog.Content';

/* -------------------------------------------------------------------------------------------------
 * Dialog.CombinedContent
 * -----------------------------------------------------------------------------------------------*/

type DialogCombinedContentProps = DialogContentProps;

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

type DialogTriggerProps = VaporComponentProps<typeof RadixTrigger>;

const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
    ({ className, ...props }, ref) => {
        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <RadixTrigger
                ref={ref}
                className={clsx(sprinkles(layoutProps), className)}
                {...otherProps}
            />
        );
    },
);
Trigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

type DialogCloseProps = VaporComponentProps<typeof RadixClose>;

const Close = forwardRef<HTMLButtonElement, DialogCloseProps>(({ className, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <RadixClose ref={ref} className={clsx(sprinkles(layoutProps), className)} {...otherProps} />
    );
});
Close.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

type DialogTitleProps = VaporComponentProps<typeof RadixTitle>;

const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <RadixTitle
            ref={ref}
            className={clsx(styles.title, sprinkles(layoutProps), className)}
            {...otherProps}
        />
    );
});
Title.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

type DialogDescriptionProps = VaporComponentProps<typeof RadixDescription>;

const Description = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
    ({ className, ...props }, ref) => {
        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <RadixDescription
                ref={ref}
                className={clsx(styles.description, sprinkles(layoutProps), className)}
                {...otherProps}
            />
        );
    },
);
Description.displayName = 'Dialog.Description';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Header
 * -----------------------------------------------------------------------------------------------*/

type DialogHeaderProps = VaporComponentProps<'div'>;

const Header = forwardRef<HTMLDivElement, DialogHeaderProps>(({ className, ...props }, ref) => {
    return <vapor.div ref={ref} className={clsx(styles.header, className)} {...props} />;
});
Header.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

type DialogBodyProps = VaporComponentProps<'div'>;

const Body = forwardRef<HTMLDivElement, DialogBodyProps>(({ className, ...props }, ref) => {
    return <vapor.div ref={ref} className={clsx(styles.body, className)} {...props} />;
});
Body.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

type DialogFooterProps = VaporComponentProps<'div'>;

const Footer = forwardRef<HTMLDivElement, DialogFooterProps>(({ className, ...props }, ref) => {
    return <vapor.div ref={ref} className={clsx(styles.footer, className)} {...props} />;
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
