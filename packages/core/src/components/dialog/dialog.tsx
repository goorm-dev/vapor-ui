import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Box } from '../box';
import * as styles from './dialog.css';
import {
    Close as RadixClose,
    Content as RadixContent,
    Description as RadixDescription,
    Dialog as RadixDialog,
    Overlay as RadixOverlay,
    Portal as RadixPortal,
    Title as RadixTitle,
    Trigger as RadixTrigger,
} from '@radix-ui/react-dialog';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { splitLayoutProps, vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import type { Sprinkles } from '~/styles/sprinkles.css';

type DialogVariants = MergeRecipeVariants<typeof styles.content>;
type DialogSharedProps = DialogVariants & { scrimClickable?: boolean };
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
interface DialogProps extends DialogPrimitiveProps, DialogSharedProps {}

const Root = ({ size, scrimClickable, children, ...props }: DialogProps) => {
    return (
        <RadixDialog {...props}>
            <DialogRoot value={{ size, scrimClickable }}>{children}</DialogRoot>
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
interface DialogOverlayProps extends PrimitiveOverlayProps {}

const Overlay = forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, ...props }, ref) => {
    return <RadixOverlay ref={ref} className={clsx(styles.overlay, className)} {...props} />;
});
Overlay.displayName = 'Dialog.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Content
 * -----------------------------------------------------------------------------------------------*/

type PointerDownOutsideEvent = CustomEvent<{
    originalEvent: PointerEvent;
}>;

type DialogContentPrimitiveProps = ComponentPropsWithoutRef<typeof RadixContent>;
interface DialogContentProps extends DialogContentPrimitiveProps, Sprinkles {}

const Content = forwardRef<HTMLDivElement, DialogContentProps>(
    ({ onPointerDownOutside, className, ...props }, ref) => {
        const { size, scrimClickable = true } = useDialogContext();
        const [sprinkles, otherProps] = splitLayoutProps(props);

        const handlePointerDownOutside = (event: PointerDownOutsideEvent) => {
            if (scrimClickable) return;

            event.preventDefault();
            onPointerDownOutside?.(event);
        };

        return (
            <Box asChild {...sprinkles}>
                <RadixContent
                    ref={ref}
                    className={clsx(styles.content({ size }), className)}
                    onPointerDownOutside={handlePointerDownOutside}
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

const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(({ ...props }, ref) => {
    const [sprinkles, otherProps] = splitLayoutProps(props);

    return (
        <Box asChild {...sprinkles}>
            <RadixTrigger ref={ref} {...otherProps} />
        </Box>
    );
});
Trigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

type ClosePrimitiveProps = ComponentPropsWithoutRef<typeof RadixClose>;
interface DialogCloseProps extends ClosePrimitiveProps, Sprinkles {}

const Close = forwardRef<HTMLButtonElement, DialogCloseProps>((props, ref) => {
    const [sprinkles, otherProps] = splitLayoutProps(props);

    return (
        <Box asChild {...sprinkles}>
            <RadixClose ref={ref} {...otherProps} />
        </Box>
    );
});
Close.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

type TitlePrimitiveProps = ComponentPropsWithoutRef<typeof RadixTitle>;
interface DialogTitleProps extends TitlePrimitiveProps, Sprinkles {}

const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, ...props }, ref) => {
    const [sprinkles, otherProps] = splitLayoutProps(props);

    return (
        <Box asChild {...sprinkles}>
            <RadixTitle ref={ref} className={clsx(styles.title, className)} {...otherProps} />
        </Box>
    );
});
Title.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveDescriptionProps = ComponentPropsWithoutRef<typeof RadixDescription>;
interface DialogDescriptionProps extends PrimitiveDescriptionProps {}

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

type PrimitiveHeaderProps = ComponentPropsWithoutRef<typeof vapor.div>;
interface DialogHeaderProps extends PrimitiveHeaderProps {}

const Header = forwardRef<HTMLDivElement, DialogHeaderProps>(({ className, ...props }, ref) => {
    return <vapor.div ref={ref} className={clsx(styles.header, className)} {...props} />;
});
Header.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveBodyProps = ComponentPropsWithoutRef<typeof vapor.div>;
interface DialogBodyProps extends PrimitiveBodyProps {}

const Body = forwardRef<HTMLDivElement, DialogBodyProps>(({ className, ...props }, ref) => {
    return <vapor.div ref={ref} className={clsx(styles.body, className)} {...props} />;
});
Body.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveFooterProps = ComponentPropsWithoutRef<typeof vapor.div>;
interface DialogFooterProps extends PrimitiveFooterProps {}

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
    DialogProps,
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
