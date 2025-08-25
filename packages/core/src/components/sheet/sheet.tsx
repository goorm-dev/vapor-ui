import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Dialog } from '../dialog';
import * as styles from './sheet.css';

type SheetPositionerProps = { side?: 'top' | 'right' | 'bottom' | 'left' };
type SheetContext = SheetPositionerProps;

const [SheetProvider, useSheetContext] = createContext<SheetContext>({
    name: 'SheetContext',
    providerName: 'SheetProvider',
    hookName: 'useSheetContext',
});

/* -------------------------------------------------------------------------------------------------
 * Sheet.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = Omit<VComponentProps<typeof Dialog.Root>, 'size'>;
interface SheetRootProps extends RootPrimitiveProps, SheetPositionerProps {}

const Root = ({ closeOnClickOverlay, ...props }: SheetRootProps) => {
    const [variantProps, otherProps] = createSplitProps<SheetPositionerProps>()(props, ['side']);

    return (
        <SheetProvider value={variantProps}>
            <BaseDialog.Root dismissible={closeOnClickOverlay} {...otherProps} />
        </SheetProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Sheet.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface SheetTriggerProps extends VComponentProps<typeof Dialog.Trigger> {}
const Trigger = Dialog.Trigger;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Close
 * -----------------------------------------------------------------------------------------------*/

interface SheetCloseProps extends VComponentProps<typeof Dialog.Close> {}
const Close = Dialog.Close;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Overlay
 * -----------------------------------------------------------------------------------------------*/

interface SheetOverlayProps extends VComponentProps<typeof Dialog.Overlay> {}
const Overlay = Dialog.Overlay;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Portal
 * -----------------------------------------------------------------------------------------------*/

interface SheetPortalProps extends VComponentProps<typeof Dialog.Portal> {}
const Portal = Dialog.Portal;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Content
 * -----------------------------------------------------------------------------------------------*/

interface SheetContentProps extends VComponentProps<typeof BaseDialog.Popup> {}

const Content = forwardRef<HTMLDivElement, SheetContentProps>(({ className, ...props }, ref) => {
    const { side = 'right' } = useSheetContext();

    return (
        <BaseDialog.Popup
            ref={ref}
            data-side={side}
            className={clsx(styles.content, className)}
            {...props}
        />
    );
});
Content.displayName = 'Sheet.Content';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Header
 * -----------------------------------------------------------------------------------------------*/

interface SheetHeaderProps extends VComponentProps<typeof Dialog.Header> {}

const Header = forwardRef<HTMLDivElement, SheetHeaderProps>(({ className, ...props }, ref) => {
    return <Dialog.Header ref={ref} className={clsx(styles.header, className)} {...props} />;
});
Header.displayName = 'Sheet.Header';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Body
 * -----------------------------------------------------------------------------------------------*/

interface SheetBodyProps extends VComponentProps<typeof Dialog.Body> {}

const Body = forwardRef<HTMLDivElement, SheetBodyProps>(({ className, ...props }, ref) => {
    return <Dialog.Body ref={ref} className={clsx(styles.body, className)} {...props} />;
});
Body.displayName = 'Sheet.Body';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Footer
 * -----------------------------------------------------------------------------------------------*/

interface SheetFooterProps extends VComponentProps<typeof Dialog.Footer> {}

const Footer = forwardRef<HTMLDivElement, SheetFooterProps>(({ className, ...props }, ref) => {
    return <Dialog.Footer ref={ref} className={clsx(styles.footer, className)} {...props} />;
});
Footer.displayName = 'Sheet.Footer';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Title
 * -----------------------------------------------------------------------------------------------*/

interface SheetTitleProps extends VComponentProps<typeof Dialog.Title> {}
const Title = Dialog.Title;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Description
 * -----------------------------------------------------------------------------------------------*/

interface SheetDescriptionProps extends VComponentProps<typeof Dialog.Description> {}
const Description = Dialog.Description;

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as SheetRoot,
    Trigger as SheetTrigger,
    Close as SheetClose,
    Overlay as SheetOverlay,
    Portal as SheetPortal,
    Content as SheetContent,
    Header as SheetHeader,
    Body as SheetBody,
    Footer as SheetFooter,
    Title as SheetTitle,
    Description as SheetDescription,
};

export type {
    SheetRootProps,
    SheetTriggerProps,
    SheetCloseProps,
    SheetOverlayProps,
    SheetPortalProps,
    SheetContentProps,
    SheetHeaderProps,
    SheetBodyProps,
    SheetFooterProps,
    SheetTitleProps,
    SheetDescriptionProps,
};

export const Sheet = {
    Root,
    Trigger,
    Close,
    Overlay,
    Portal,
    Content,
    Header,
    Body,
    Footer,
    Title,
    Description,
};
