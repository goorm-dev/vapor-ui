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
import type { Sprinkles } from '~/styles/sprinkles.css';

import { Box } from '../box';
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

type DialogOverlayProps = ComponentPropsWithoutRef<typeof RadixOverlay>;

const Overlay = forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, ...props }, ref) => {
    return <RadixOverlay ref={ref} className={clsx(styles.overlay, className)} {...props} />;
});
Overlay.displayName = 'Dialog.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Content
 * -----------------------------------------------------------------------------------------------*/

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type DialogContentProps = ComponentPropsWithoutRef<typeof RadixContent> & Sprinkles;

const Content = forwardRef<HTMLDivElement, DialogContentProps>(
    ({ onPointerDownOutside, onEscapeKeyDown, className, ...props }, ref) => {
        const { size, closeOnClickOverlay = true, closeOnEscape = true } = useDialogContext();
        const [sprinkles, otherProps] = splitLayoutProps(props);

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
            <Box asChild {...sprinkles}>
                <RadixContent
                    ref={ref}
                    className={clsx(styles.content({ size }), className)}
                    onPointerDownOutside={handlePointerDownOutside}
                    onEscapeKeyDown={handleEscapeKeyDown}
                    {...otherProps}
                />
            </Box>
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
 * Dialog.Trigger, Close, Title, Description (based Radix)
 * -----------------------------------------------------------------------------------------------*/
type DialogTriggerProps = ComponentPropsWithoutRef<typeof RadixTrigger> & Sprinkles;
type DialogCloseProps = ComponentPropsWithoutRef<typeof RadixClose> & Sprinkles;
type DialogTitleProps = ComponentPropsWithoutRef<typeof RadixTitle> & Sprinkles;
type DialogDescriptionProps = ComponentPropsWithoutRef<typeof RadixDescription>;

const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(({ ...props }, ref) => {
    const [sprinkles, otherProps] = splitLayoutProps(props);
    return (
        <Box asChild {...sprinkles}>
            <RadixTrigger ref={ref} {...otherProps} />
        </Box>
    );
});
Trigger.displayName = 'Dialog.Trigger';

const Close = forwardRef<HTMLButtonElement, DialogCloseProps>((props, ref) => {
    const [sprinkles, otherProps] = splitLayoutProps(props);
    return (
        <Box asChild {...sprinkles}>
            <RadixClose ref={ref} {...otherProps} />
        </Box>
    );
});
Close.displayName = 'Dialog.Close';

const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, ...props }, ref) => {
    const [sprinkles, otherProps] = splitLayoutProps(props);
    return (
        <Box asChild {...sprinkles}>
            <RadixTitle ref={ref} className={clsx(styles.title, className)} {...otherProps} />
        </Box>
    );
});
Title.displayName = 'Dialog.Title';

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
 * Dialog.Header, Body, Footer (based Vapor)
 * -----------------------------------------------------------------------------------------------*/

type DialogHeaderProps = VaporComponentProps<'div'>;
type DialogBodyProps = VaporComponentProps<'div'>;
type DialogFooterProps = VaporComponentProps<'div'>;

const Header = forwardRef<HTMLDivElement, DialogHeaderProps>(({ className, ...props }, ref) => {
    return <vapor.div ref={ref} className={clsx(styles.header, className)} {...props} />;
});
Header.displayName = 'Dialog.Header';

const Body = forwardRef<HTMLDivElement, DialogBodyProps>(({ className, ...props }, ref) => {
    return <vapor.div ref={ref} className={clsx(styles.body, className)} {...props} />;
});
Body.displayName = 'Dialog.Body';

const Footer = forwardRef<HTMLDivElement, DialogFooterProps>(({ className, ...props }, ref) => {
    return <vapor.div ref={ref} className={clsx(styles.footer, className)} {...props} />;
});
Footer.displayName = 'Dialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export const Dialog = Object.assign(Root, {
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
});

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
