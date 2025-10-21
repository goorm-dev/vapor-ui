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

export const SheetRoot = ({
    open: openProp,
    defaultOpen,
    onOpenChange,
    ...props
}: SheetRoot.Props) => {
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

    const handleOpenChange = (open: boolean, eventDetails: SheetRoot.OpenChangeEvent) => {
        setOpen(open);
        onOpenChange?.(open, eventDetails);
    };

    return (
        <SheetRootProvider value={{ open, mounted, setMounted, transitionStatus, popupRef }}>
            <Dialog.Root open={open} onOpenChange={handleOpenChange} {...props} />
        </SheetRootProvider>
    );
};
SheetRoot.displayName = 'Sheet.Root';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const SheetTrigger = Dialog.Trigger;
SheetTrigger.displayName = 'Sheet.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Close
 * -----------------------------------------------------------------------------------------------*/

export const SheetClose = Dialog.Close;
SheetClose.displayName = 'Sheet.Close';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Overlay
 * -----------------------------------------------------------------------------------------------*/

export const SheetOverlay = Dialog.Overlay;
SheetOverlay.displayName = 'Sheet.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Portal
 * -----------------------------------------------------------------------------------------------*/

export const SheetPortal = (props: SheetPortal.Props) => {
    return <Dialog.Portal {...props} />;
};
SheetPortal.displayName = 'Sheet.Portal';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Positioner
 * -----------------------------------------------------------------------------------------------*/

type PositionerType = { side?: 'top' | 'right' | 'bottom' | 'left' };

const [SheetPositionerProvider, useSheetPositionerContext] = createContext<PositionerType>({
    name: 'SheetPositioner',
    providerName: 'SheetPositionerProvider',
    hookName: 'useSheetPositionerContext',
});

export const SheetPositioner = forwardRef<HTMLDivElement, SheetPositioner.Props>(
    ({ render, ...props }, ref) => {
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
    },
);
SheetPositioner.displayName = 'Sheet.Positioner';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Popup
 * -----------------------------------------------------------------------------------------------*/

export const SheetPopup = forwardRef<HTMLDivElement, SheetPopup.Props>(
    ({ className, ...props }, ref) => {
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
    },
);
SheetPopup.displayName = 'Sheet.Popup';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Content
 * -----------------------------------------------------------------------------------------------*/

export const SheetContent = forwardRef<HTMLDivElement, SheetContent.Props>(
    ({ portalProps, overlayProps, positionerProps, className, ...props }, ref) => {
        return (
            <SheetPortal {...portalProps}>
                <SheetOverlay {...overlayProps} />
                <SheetPositioner {...positionerProps}>
                    <SheetPopup ref={ref} {...props} />
                </SheetPositioner>
            </SheetPortal>
        );
    },
);
SheetContent.displayName = 'Sheet.Content';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Header
 * -----------------------------------------------------------------------------------------------*/

export const SheetHeader = forwardRef<HTMLDivElement, SheetHeader.Props>(
    ({ className, ...props }, ref) => {
        return <Dialog.Header ref={ref} className={clsx(styles.header, className)} {...props} />;
    },
);
SheetHeader.displayName = 'Sheet.Header';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Body
 * -----------------------------------------------------------------------------------------------*/

export const SheetBody = forwardRef<HTMLDivElement, SheetBody.Props>(
    ({ className, ...props }, ref) => {
        return <Dialog.Body ref={ref} className={clsx(styles.body, className)} {...props} />;
    },
);
SheetBody.displayName = 'Sheet.Body';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Footer
 * -----------------------------------------------------------------------------------------------*/

export const SheetFooter = forwardRef<HTMLDivElement, SheetFooter.Props>(
    ({ className, ...props }, ref) => {
        return <Dialog.Footer ref={ref} className={clsx(styles.footer, className)} {...props} />;
    },
);
SheetFooter.displayName = 'Sheet.Footer';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Title
 * -----------------------------------------------------------------------------------------------*/

export const SheetTitle = Dialog.Title;
SheetTitle.displayName = 'Sheet.Title';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Description
 * -----------------------------------------------------------------------------------------------*/

export const SheetDescription = Dialog.Description;
SheetDescription.displayName = 'Sheet.Description';

/* -----------------------------------------------------------------------------------------------*/

export namespace SheetRoot {
    type RootPrimitiveProps = Omit<VComponentProps<typeof Dialog.Root>, 'size'>;
    export interface Props extends RootPrimitiveProps {}
    export type OpenChangeEvent = BaseDialog.Root.ChangeEventDetails;
}

export namespace SheetTrigger {
    type TriggerPrimitiveProps = VComponentProps<typeof Dialog.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace SheetClose {
    type ClosePrimitiveProps = VComponentProps<typeof Dialog.Close>;
    export interface Props extends ClosePrimitiveProps {}
}

export namespace SheetOverlay {
    type OverlayPrimitiveProps = VComponentProps<typeof Dialog.Overlay>;
    export interface Props extends OverlayPrimitiveProps {}
}

export namespace SheetPortal {
    type PortalPrimitiveProps = VComponentProps<typeof Dialog.Portal>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace SheetPositioner {
    type PositionerPrimitiveProps = VComponentProps<'div'>;
    export interface Props extends PositionerPrimitiveProps, PositionerType {}
}

export namespace SheetPopup {
    type PopupPrimitiveProps = VComponentProps<typeof BaseDialog.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace SheetContent {
    type ContentPrimitiveProps = VComponentProps<typeof BaseDialog.Popup>;
    export interface Props extends ContentPrimitiveProps {
        portalProps?: SheetPortal.Props;
        overlayProps?: SheetOverlay.Props;
        positionerProps?: SheetPositioner.Props;
    }
}

export namespace SheetHeader {
    type HeaderPrimitiveProps = VComponentProps<typeof Dialog.Header>;
    export interface Props extends HeaderPrimitiveProps {}
}

export namespace SheetBody {
    type BodyPrimitiveProps = VComponentProps<typeof Dialog.Body>;
    export interface Props extends BodyPrimitiveProps {}
}

export namespace SheetFooter {
    type FooterPrimitiveProps = VComponentProps<typeof Dialog.Footer>;
    export interface Props extends FooterPrimitiveProps {}
}

export namespace SheetTitle {
    type TitlePrimitiveProps = VComponentProps<typeof Dialog.Title>;
    export interface Props extends TitlePrimitiveProps {}
}

export namespace SheetDescription {
    type DescriptionPrimitiveProps = VComponentProps<typeof Dialog.Description>;
    export interface Props extends DescriptionPrimitiveProps {}
}
