'use client';

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
import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { splitLayoutProps } from '~/utils/split-layout-props';

import * as styles from './dialog.css';

type DialogVariants = MergeRecipeVariants<typeof styles.content>;
type DialogSharedProps = DialogVariants & {
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

interface DialogPortalProps extends ComponentPropsWithoutRef<typeof RadixPortal> {}

const Portal = RadixPortal;
Portal.displayName = 'Dialog.Portal';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Overlay
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveOverlayProps = ComponentPropsWithoutRef<typeof RadixOverlay>;
interface DialogOverlayProps extends PrimitiveOverlayProps, Sprinkles {}

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

type DialogContentPrimitiveProps = ComponentPropsWithoutRef<typeof RadixContent>;
interface DialogContentProps extends DialogContentPrimitiveProps, Sprinkles {}

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

type PrimitiveCombinedContentProps = ComponentPropsWithoutRef<typeof Content>;
interface DialogCombinedContentProps extends PrimitiveCombinedContentProps {}

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

type TriggerPrimitiveProps = ComponentPropsWithoutRef<typeof RadixTrigger>;
interface DialogTriggerProps extends TriggerPrimitiveProps, Sprinkles {}

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

type ClosePrimitiveProps = ComponentPropsWithoutRef<typeof RadixClose>;
interface DialogCloseProps extends ClosePrimitiveProps, Sprinkles {}

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

type TitlePrimitiveProps = ComponentPropsWithoutRef<typeof RadixTitle>;
interface DialogTitleProps extends TitlePrimitiveProps, Sprinkles {}

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

type PrimitiveDescriptionProps = ComponentPropsWithoutRef<typeof RadixDescription>;
interface DialogDescriptionProps extends PrimitiveDescriptionProps, Sprinkles {}

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

type PrimitiveHeaderProps = ComponentPropsWithoutRef<typeof vapor.div>;
interface DialogHeaderProps extends PrimitiveHeaderProps, Sprinkles {}

const Header = forwardRef<HTMLDivElement, DialogHeaderProps>(({ className, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <vapor.div
            ref={ref}
            className={clsx(styles.header, sprinkles(layoutProps), className)}
            {...otherProps}
        />
    );
});
Header.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveBodyProps = ComponentPropsWithoutRef<typeof vapor.div>;
interface DialogBodyProps extends PrimitiveBodyProps, Sprinkles {}

const Body = forwardRef<HTMLDivElement, DialogBodyProps>(({ className, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <vapor.div
            ref={ref}
            className={clsx(styles.body, sprinkles(layoutProps), className)}
            {...otherProps}
        />
    );
});
Body.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveFooterProps = ComponentPropsWithoutRef<typeof vapor.div>;
interface DialogFooterProps extends PrimitiveFooterProps, Sprinkles {}

const Footer = forwardRef<HTMLDivElement, DialogFooterProps>(({ className, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <vapor.div
            ref={ref}
            className={clsx(styles.footer, sprinkles(layoutProps), className)}
            {...otherProps}
        />
    );
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
    Portal,
    Overlay,
    Content,
    CombinedContent,
    Trigger,
    Close,
    Title,
    Description,
    Header,
    Body,
    Footer,
};
