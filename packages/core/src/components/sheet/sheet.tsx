'use client';

import type { RefObject } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import { Dialog as BaseDialog, useRender } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import { useEventCallback } from '@base-ui-components/utils/useEventCallback';
import clsx from 'clsx';

import { useOpenChangeComplete } from '~/hooks/use-open-change-complete';
import type { TransitionStatus } from '~/hooks/use-transition-status';
import { useTransitionStatus } from '~/hooks/use-transition-status';
import { createContext } from '~/libs/create-context';
import { composeRefs } from '~/utils/compose-refs';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import type { VComponentProps } from '~/utils/types';

import { Dialog } from '../dialog';
import * as styles from './sheet.css';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Root
 * -----------------------------------------------------------------------------------------------*/

type RootContext = {
    open?: boolean;
    mounted: boolean;
    setMounted: React.Dispatch<React.SetStateAction<boolean>>;
    transitionStatus: TransitionStatus;
    popupRef: RefObject<HTMLDivElement | null>;
};

const [SheetRootProvider, useSheetRootContext] = createContext<RootContext>({
    name: 'SheetRoot',
    providerName: 'SheetRootProvider',
    hookName: 'useSheetRootContext',
});

/* -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = Omit<VComponentProps<typeof Dialog.Root>, 'size'>;
interface SheetRootProps extends RootPrimitiveProps {}

/**
 * Provides the root context for a sheet dialog that slides in from screen edges. Renders a <div> element.
 */
const Root = ({ open: openProp, defaultOpen, onOpenChange, ...props }: SheetRootProps) => {
    const [open, setOpen] = useControlled({
        controlled: openProp,
        default: defaultOpen || false,
        name: 'SheetRoot',
        state: 'open',
    });

    const popupRef = useRef<HTMLDivElement | null>(null);

    const { mounted, setMounted, transitionStatus } = useTransitionStatus(open);
    const handleUnmount = useEventCallback(() => {
        setMounted(false);
    });

    useOpenChangeComplete({
        enabled: !props.actionsRef,
        open,
        ref: popupRef,
        onComplete() {
            if (!open) {
                handleUnmount();
            }
        },
    });

    useImperativeHandle(props.actionsRef, () => ({ unmount: handleUnmount }), [handleUnmount]);

    const handleOpenChange = (
        ...params: Parameters<NonNullable<RootPrimitiveProps['onOpenChange']>>
    ) => {
        const [nextOpen] = params;

        setOpen(nextOpen);
        onOpenChange?.(...params);
    };

    return (
        <SheetRootProvider value={{ open, mounted, setMounted, transitionStatus, popupRef }}>
            <Dialog.Root open={open} onOpenChange={handleOpenChange} {...props} />
        </SheetRootProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Sheet.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface SheetTriggerProps extends VComponentProps<typeof Dialog.Trigger> {}
/**
 * Renders a button that triggers the sheet to open. Renders a <button> element.
 */
const Trigger = Dialog.Trigger;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Close
 * -----------------------------------------------------------------------------------------------*/

interface SheetCloseProps extends VComponentProps<typeof Dialog.Close> {}
/**
 * Renders a button that closes the sheet. Renders a <button> element.
 */
const Close = Dialog.Close;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Overlay
 * -----------------------------------------------------------------------------------------------*/

interface SheetOverlayProps extends VComponentProps<typeof Dialog.Overlay> {}
/**
 * Renders an overlay backdrop behind the sheet. Renders a <div> element.
 */
const Overlay = Dialog.Overlay;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Portal
 * -----------------------------------------------------------------------------------------------*/

interface SheetPortalProps extends VComponentProps<typeof Dialog.Portal> {}

/**
 * Renders sheet content in a portal outside the normal DOM tree.
 */
const Portal = (props: SheetPortalProps) => {
    return <Dialog.Portal {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Sheet.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerType = { side?: 'top' | 'right' | 'bottom' | 'left' };

const [SheetPositionerProvider, useSheetPositionerContext] = createContext<PositionerType>({
    name: 'SheetPositioner',
    providerName: 'SheetPositionerProvider',
    hookName: 'useSheetPositionerContext',
});

interface SheetPositionerProps extends VComponentProps<'div'>, PositionerType {}

/**
 * Positions the sheet on a specific side of the screen. Renders a <div> element.
 */
const Positioner = forwardRef<HTMLDivElement, SheetPositionerProps>(({ render, ...props }, ref) => {
    const [positionerProps, otherProps] = createSplitProps<PositionerType>()(props, ['side']);
    const { side = 'right' } = positionerProps;

    const { open: contextOpen = false, mounted } = useSheetRootContext();

    const dataAttr = createDataAttributes({
        open: contextOpen,
        closed: !contextOpen,
        side: side,
    });

    const element = useRender({
        ref,
        render: render || <div />,
        props: {
            role: 'presentation',
            hidden: !mounted,
            ...dataAttr,
            ...otherProps,
        },
    });

    return <SheetPositionerProvider value={positionerProps}>{element}</SheetPositionerProvider>;
});

/* -------------------------------------------------------------------------------------------------
 * Sheet.Popup
 * -----------------------------------------------------------------------------------------------*/

interface SheetPopupProps extends VComponentProps<typeof BaseDialog.Popup> {}

/**
 * Renders the sheet popup container with slide animations. Renders a <div> element.
 */
const Popup = forwardRef<HTMLDivElement, SheetPopupProps>(({ className, ...props }, ref) => {
    const { popupRef } = useSheetRootContext();
    const { side = 'right' } = useSheetPositionerContext();

    const composedRef = composeRefs(popupRef, ref);

    const dataAttr = createDataAttributes({ side: side });

    return (
        <BaseDialog.Popup
            ref={composedRef}
            className={clsx(styles.popup, className)}
            {...dataAttr}
            {...props}
        />
    );
});
Popup.displayName = 'Sheet.Popup';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Content
 * -----------------------------------------------------------------------------------------------*/

interface SheetContentProps extends VComponentProps<typeof BaseDialog.Popup> {
    portalProps?: SheetPortalProps;
    overlayProps?: SheetOverlayProps;
    positionerProps?: SheetPositionerProps;
}

/**
 * Combines Portal, Overlay, Positioner, and Popup for easy sheet rendering. Renders a <div> element.
 */
const Content = forwardRef<HTMLDivElement, SheetContentProps>(
    ({ portalProps, overlayProps, positionerProps, className, ...props }, ref) => {
        return (
            <Portal {...portalProps}>
                <Overlay {...overlayProps} />
                <Positioner {...positionerProps}>
                    <Popup ref={ref} {...props} />
                </Positioner>
            </Portal>
        );
    },
);
Content.displayName = 'Sheet.Content';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Header
 * -----------------------------------------------------------------------------------------------*/

interface SheetHeaderProps extends VComponentProps<typeof Dialog.Header> {}

/**
 * Renders the header section of the sheet with title and description. Renders a <div> element.
 */
const Header = forwardRef<HTMLDivElement, SheetHeaderProps>(({ className, ...props }, ref) => {
    return <Dialog.Header ref={ref} className={clsx(styles.header, className)} {...props} />;
});
Header.displayName = 'Sheet.Header';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Body
 * -----------------------------------------------------------------------------------------------*/

interface SheetBodyProps extends VComponentProps<typeof Dialog.Body> {}

/**
 * Renders the main content area of the sheet. Renders a <div> element.
 */
const Body = forwardRef<HTMLDivElement, SheetBodyProps>(({ className, ...props }, ref) => {
    return <Dialog.Body ref={ref} className={clsx(styles.body, className)} {...props} />;
});
Body.displayName = 'Sheet.Body';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Footer
 * -----------------------------------------------------------------------------------------------*/

interface SheetFooterProps extends VComponentProps<typeof Dialog.Footer> {}

/**
 * Renders the footer section of the sheet with action buttons. Renders a <div> element.
 */
const Footer = forwardRef<HTMLDivElement, SheetFooterProps>(({ className, ...props }, ref) => {
    return <Dialog.Footer ref={ref} className={clsx(styles.footer, className)} {...props} />;
});
Footer.displayName = 'Sheet.Footer';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Title
 * -----------------------------------------------------------------------------------------------*/

interface SheetTitleProps extends VComponentProps<typeof Dialog.Title> {}
/**
 * Renders the title of the sheet for accessibility. Renders an <h2> element.
 */
const Title = Dialog.Title;

/* -------------------------------------------------------------------------------------------------
 * Sheet.Description
 * -----------------------------------------------------------------------------------------------*/

interface SheetDescriptionProps extends VComponentProps<typeof Dialog.Description> {}
/**
 * Renders the description of the sheet for accessibility. Renders a <p> element.
 */
const Description = Dialog.Description;

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as SheetRoot,
    Trigger as SheetTrigger,
    Close as SheetClose,
    Overlay as SheetOverlay,
    Portal as SheetPortal,
    Positioner as SheetPositioner,
    Popup as SheetPopup,
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
    SheetPositionerProps,
    SheetPopupProps,
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
    Popup,
    Positioner,
    Content,
    Header,
    Body,
    Footer,
    Title,
    Description,
};
