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
import { resolveStyles } from '~/utils/resolve-styles';
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

const Positioner = forwardRef<HTMLDivElement, SheetPositionerProps>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    const [positionerProps, otherProps] = createSplitProps<PositionerType>()(componentProps, [
        'side',
    ]);
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

const Popup = forwardRef<HTMLDivElement, SheetPopupProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    const { popupRef } = useSheetRootContext();
    const { side = 'right' } = useSheetPositionerContext();

    const composedRef = composeRefs(popupRef, ref);

    const dataAttr = createDataAttributes({ side: side });

    return (
        <BaseDialog.Popup
            ref={composedRef}
            className={clsx(styles.popup, className)}
            {...dataAttr}
            {...componentProps}
        />
    );
});
Popup.displayName = 'Sheet.Popup';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Content
 * -----------------------------------------------------------------------------------------------*/

interface SheetContentProps extends VComponentProps<typeof Popup> {
    portalProps?: SheetPortalProps;
    overlayProps?: SheetOverlayProps;
    positionerProps?: SheetPositionerProps;
}

const Content = forwardRef<HTMLDivElement, SheetContentProps>(
    ({ portalProps, overlayProps, positionerProps, ...props }, ref) => {
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

const Header = forwardRef<HTMLDivElement, SheetHeaderProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <Dialog.Header ref={ref} className={clsx(styles.header, className)} {...componentProps} />
    );
});
Header.displayName = 'Sheet.Header';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Body
 * -----------------------------------------------------------------------------------------------*/

interface SheetBodyProps extends VComponentProps<typeof Dialog.Body> {}

const Body = forwardRef<HTMLDivElement, SheetBodyProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <Dialog.Body ref={ref} className={clsx(styles.body, className)} {...componentProps} />;
});
Body.displayName = 'Sheet.Body';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Footer
 * -----------------------------------------------------------------------------------------------*/

interface SheetFooterProps extends VComponentProps<typeof Dialog.Footer> {}

const Footer = forwardRef<HTMLDivElement, SheetFooterProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <Dialog.Footer ref={ref} className={clsx(styles.footer, className)} {...componentProps} />
    );
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
