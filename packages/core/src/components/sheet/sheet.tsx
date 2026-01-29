'use client';

import type { ReactElement, RefObject } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useRender } from '@base-ui/react/use-render';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import clsx from 'clsx';

import { useOpenChangeComplete } from '~/hooks/use-open-change-complete';
import type { TransitionStatus } from '~/hooks/use-transition-status';
import { useTransitionStatus } from '~/hooks/use-transition-status';
import { createContext } from '~/libs/create-context';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
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

/**
 * Root component of Sheet that manages open/close state and settings. Renders a `<div>` element.
 */
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
    const handleUnmount = useStableCallback(() => {
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

    const handleClose = useStableCallback(() => {
        setOpen(false);
    });

    useImperativeHandle(props.actionsRef, () => ({ unmount: handleUnmount, close: handleClose }), [
        handleUnmount,
        handleClose,
    ]);

    const handleOpenChange = (open: boolean, eventDetails: SheetRoot.ChangeEventDetails) => {
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

/**
 * Button that triggers the Sheet to open. Renders a `<button>` element.
 */
export const SheetTrigger = Dialog.Trigger;
SheetTrigger.displayName = 'Sheet.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Close
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that closes the Sheet. Renders a `<button>` element.
 */
export const SheetClose = Dialog.Close;
SheetClose.displayName = 'Sheet.Close';

/* -------------------------------------------------------------------------------------------------
 * Sheet.OverlayPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Background overlay for Sheet. Renders a `<div>` element.
 */
export const SheetOverlayPrimitive = Dialog.OverlayPrimitive;
SheetOverlayPrimitive.displayName = 'Sheet.OverlayPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Sheet.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const SheetPortalPrimitive = (props: SheetPortalPrimitive.Props) => {
    return <Dialog.PortalPrimitive {...props} />;
};
SheetPortalPrimitive.displayName = 'Sheet.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Sheet.PositionerPrimitive
 * -----------------------------------------------------------------------------------------------*/

type PositionerType = { side?: 'top' | 'right' | 'bottom' | 'left' };

const [SheetPositionerProvider, useSheetPositionerContext] = createContext<PositionerType>({
    name: 'SheetPositioner',
    providerName: 'SheetPositionerProvider',
    hookName: 'useSheetPositionerContext',
});

/**
 * Positions the Sheet popup at the specified side of the screen. Renders a `<div>` element.
 */
export const SheetPositionerPrimitive = forwardRef<HTMLDivElement, SheetPositionerPrimitive.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);

        const [positionerProps, otherProps] = createSplitProps<PositionerType>()(componentProps, [
            'side',
        ]);
        const { side = 'right' } = positionerProps;

        const { open: contextOpen = false, mounted } = useSheetRootContext();

        const element = useRender({
            ref,
            render: render || <div />,
            state: { open: contextOpen, closed: !contextOpen, side },
            props: {
                role: 'presentation',
                hidden: !mounted,
                ...otherProps,
            },
        });

        return <SheetPositionerProvider value={positionerProps}>{element}</SheetPositionerProvider>;
    },
);
SheetPositionerPrimitive.displayName = 'Sheet.PositionerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Sheet.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Sheet popup container that slides in from the screen edge. Renders a `<div>` element.
 */
export const SheetPopupPrimitive = forwardRef<HTMLDivElement, SheetPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        const { popupRef } = useSheetRootContext();
        const { side = 'right' } = useSheetPositionerContext();

        const composedRef = composeRefs(popupRef, ref);

        const dataAttr = createDataAttributes({ side });

        return (
            <BaseDialog.Popup
                ref={composedRef}
                className={clsx(styles.popup, className)}
                {...dataAttr}
                {...componentProps}
            />
        );
    },
);
SheetPopupPrimitive.displayName = 'Sheet.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Composed popup component that includes portal, overlay, positioner, and popup primitive. Renders a `<div>` element.
 */
export const SheetPopup = forwardRef<HTMLDivElement, SheetPopup.Props>(
    ({ portalElement, overlayElement, positionerElement, ...props }, ref) => {
        const popup = <SheetPopupPrimitive ref={ref} {...props} />;

        const positioner = useRender({
            render: createRender(positionerElement, <SheetPositionerPrimitive />),
            props: { children: popup },
        });

        const overlay = useRender({
            render: createRender(overlayElement, <SheetOverlayPrimitive />),
        });

        const portal = useRender({
            render: createRender(portalElement, <SheetPortalPrimitive />),
            props: {
                children: (
                    <>
                        {overlay}
                        {positioner}
                    </>
                ),
            },
        });

        return portal;
    },
);
SheetPopup.displayName = 'Sheet.Popup';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Header
 * -----------------------------------------------------------------------------------------------*/

/**
 * Header section of the Sheet containing title and description. Renders a `<div>` element.
 */
export const SheetHeader = forwardRef<HTMLDivElement, SheetHeader.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <Dialog.Header ref={ref} className={clsx(styles.header, className)} {...componentProps} />
    );
});
SheetHeader.displayName = 'Sheet.Header';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * Main content area of the Sheet. Renders a `<div>` element.
 */
export const SheetBody = forwardRef<HTMLDivElement, SheetBody.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <Dialog.Body ref={ref} className={clsx(styles.body, className)} {...componentProps} />;
});
SheetBody.displayName = 'Sheet.Body';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * Footer section of the Sheet typically containing action buttons. Renders a `<div>` element.
 */
export const SheetFooter = forwardRef<HTMLDivElement, SheetFooter.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <Dialog.Footer ref={ref} className={clsx(styles.footer, className)} {...componentProps} />
    );
});
SheetFooter.displayName = 'Sheet.Footer';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Title
 * -----------------------------------------------------------------------------------------------*/

/**
 * Title text displayed in the Sheet header. Renders an `<h2>` element.
 */
export const SheetTitle = Dialog.Title;
SheetTitle.displayName = 'Sheet.Title';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * Description text displayed in the Sheet header. Renders a `<p>` element.
 */
export const SheetDescription = Dialog.Description;
SheetDescription.displayName = 'Sheet.Description';

/* -----------------------------------------------------------------------------------------------*/

export namespace SheetRoot {
    type RootPrimitiveProps = Omit<VComponentProps<typeof Dialog.Root>, 'size'>;
    export interface Props extends RootPrimitiveProps {}
    export type ChangeEventDetails = BaseDialog.Root.ChangeEventDetails;
}

export namespace SheetTrigger {
    type TriggerPrimitiveProps = VComponentProps<typeof Dialog.Trigger>;
    export interface Props extends TriggerPrimitiveProps {}
}

export namespace SheetClose {
    type ClosePrimitiveProps = VComponentProps<typeof Dialog.Close>;
    export interface Props extends ClosePrimitiveProps {}
}

export namespace SheetOverlayPrimitive {
    type OverlayPrimitiveProps = VComponentProps<typeof Dialog.OverlayPrimitive>;
    export interface Props extends OverlayPrimitiveProps {}
}

export namespace SheetPortalPrimitive {
    type PortalPrimitiveProps = VComponentProps<typeof Dialog.PortalPrimitive>;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace SheetPositionerPrimitive {
    type PositionerPrimitiveProps = VComponentProps<'div'>;
    export interface Props extends PositionerPrimitiveProps, PositionerType {}
}

export namespace SheetPopupPrimitive {
    type PopupPrimitiveProps = VComponentProps<typeof BaseDialog.Popup>;
    export interface Props extends PopupPrimitiveProps {}
}

export namespace SheetPopup {
    type PopupPrimitiveProps = VComponentProps<typeof BaseDialog.Popup>;
    export interface Props extends PopupPrimitiveProps {
        portalElement?: ReactElement<SheetPortalPrimitive.Props>;
        overlayElement?: ReactElement<SheetOverlayPrimitive.Props>;
        positionerElement?: ReactElement<SheetPositionerPrimitive.Props>;
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
