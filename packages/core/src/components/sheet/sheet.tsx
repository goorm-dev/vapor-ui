'use client';

import type { ReactElement, RefObject } from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';

import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useOpenChangeComplete } from '~/hooks/use-open-change-complete';
import { useRenderElement } from '~/hooks/use-render-element';
import { useResizeHandle } from '~/hooks/use-resize-handle';
import type { TransitionStatus } from '~/hooks/use-transition-status';
import { useTransitionStatus } from '~/hooks/use-transition-status';
import { useVaporId } from '~/hooks/use-vapor-id';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { composeRefs } from '~/utils/compose-refs';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

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
    /** Owned by Sheet.Popup — undefined until the popup mounts and reports its id. */
    popupId: string | undefined;
    setPopupId: (id: string | undefined) => void;
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
    const handleUnmount = useStableCallback(() => {
        setMounted(false);
    });

    const handleClose = useStableCallback(() => {
        setOpen(false);
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

    useImperativeHandle(props.actionsRef, () => ({ unmount: handleUnmount, close: handleClose }), [
        handleUnmount,
        handleClose,
    ]);

    const handleOpenChange = (open: boolean, eventDetails: SheetRoot.ChangeEventDetails) => {
        setOpen(open);
        onOpenChange?.(open, eventDetails);
    };

    // Sheet.Popup owns id generation and reports it here (RadioGroup.Label pattern),
    // so ResizeHandle's aria-controls always mirrors the actual DOM id.
    const [popupId, setPopupId] = useState<string>();

    return (
        <SheetRootProvider
            value={{
                open,
                mounted,
                setMounted,
                transitionStatus,
                popupRef,
                popupId,
                setPopupId,
            }}
        >
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
 * Sheet.OverlayPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const SheetOverlayPrimitive = Dialog.OverlayPrimitive;
SheetOverlayPrimitive.displayName = 'Sheet.OverlayPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Sheet.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const SheetPortalPrimitive = forwardRef<HTMLDivElement, SheetPortalPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);

        return <Dialog.PortalPrimitive ref={ref} {...componentProps} />;
    },
);
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

export const SheetPositionerPrimitive = forwardRef<HTMLDivElement, SheetPositionerPrimitive.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);

        const [positionerProps, otherProps] = createSplitProps<PositionerType>()(componentProps, [
            'side',
        ]);
        const { side = 'right' } = positionerProps;

        const { open: contextOpen = false, mounted } = useSheetRootContext();

        const element = useRenderElement({
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

export const SheetPopupPrimitive = forwardRef<HTMLDivElement, SheetPopupPrimitive.Props>(
    (props, ref) => {
        const { className, id: idProp, ...componentProps } = resolveStyles(props);

        const { popupRef, setPopupId } = useSheetRootContext();
        const { side = 'right' } = useSheetPositionerContext();

        const composedRef = composeRefs(popupRef, ref);

        const id = useVaporId(idProp);
        useIsoLayoutEffect(() => {
            setPopupId(id);
            return () => setPopupId(undefined);
        }, [id, setPopupId]);

        const dataAttr = createDataAttributes({ side });

        return (
            <BaseDialog.Popup
                ref={composedRef}
                id={id}
                className={cn(styles.popup, className)}
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

export const SheetPopup = forwardRef<HTMLDivElement, SheetPopup.Props>(
    ({ portalElement, overlayElement, positionerElement, ...props }, ref) => {
        const popup = <SheetPopupPrimitive ref={ref} {...props} />;

        const positionerRender = createRender(positionerElement, <SheetPositionerPrimitive />);
        const positioner = useRenderElement({
            render: positionerRender,
            props: { children: popup },
        });

        const overlayRender = createRender(overlayElement, <SheetOverlayPrimitive />);
        const overlay = useRenderElement({
            render: overlayRender,
        });

        const portalRender = createRender(portalElement, <SheetPortalPrimitive />);
        const portal = useRenderElement({
            render: portalRender,
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
 * Sheet.ResizeHandle
 * -----------------------------------------------------------------------------------------------*/

const RESIZE_STEP = 16; // px per arrow key press (spec default)

export const SheetResizeHandle = forwardRef<HTMLDivElement, SheetResizeHandle.Props>(
    (props, ref) => {
        const {
            render,
            step = RESIZE_STEP,
            disabled = false,
            className,
            onPointerDown,
            onKeyDown,
            ...componentProps
        } = resolveStyles(props);

        const { popupRef, popupId } = useSheetRootContext();
        const { side = 'right' } = useSheetPositionerContext();

        const { size, bounds, orientation, dimension, handleProps } = useResizeHandle({
            targetRef: popupRef,
            side,
            step,
            disabled,
        });

        const dimensionLabel = dimension;

        // Keyboard semantics live on the inner grip; the outer strip is drag-only.
        const gripRef = useRef<HTMLDivElement>(null);

        const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
            onPointerDown?.(event);
            // Snapshot after the user handler: only the hook runs between here and the
            // check below, so a false→true flip can only mean the hook accepted the drag.
            // A user preventDefault() (drag veto) is captured in the snapshot and ignored.
            const wasPrevented = event.defaultPrevented;
            handleProps.onPointerDown(event);
            // Drag can start anywhere on the strip, so mirror the hook's accept signal
            // to move focus to the keyboard grip — but skip it when the drag was rejected.
            if (!wasPrevented && event.defaultPrevented)
                gripRef.current?.focus({ preventScroll: true });
        };

        const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(event);
            handleProps.onKeyDown(event);
        };

        const sideProps = {
            'data-side': side,
            ...(disabled && { 'data-disabled': '' }),
        };

        // The grip is the public element: user props (render/className/style/ref/...)
        // land here so the affordance is customizable like any other sub-component.
        // The outer strip stays an internal drag surface.
        const grip = useRenderElement({
            ref: [ref, gripRef],
            render: render || <div />,
            state: { side, disabled },
            props: {
                role: 'slider',
                'aria-orientation': orientation,
                'aria-label': `Resize sheet ${dimensionLabel}`,
                'aria-controls': popupId,
                'aria-valuemin': Math.round(bounds.min),
                // Omit valuemax when the CSS max never resolved to px (unbounded).
                ...(Number.isFinite(bounds.max) && { 'aria-valuemax': Math.round(bounds.max) }),
                'aria-valuenow': Math.round(size),
                'aria-valuetext': `${dimensionLabel} ${Math.round(size)} pixels`,
                'aria-disabled': disabled || undefined,
                tabIndex: disabled ? -1 : 0,
                ...sideProps,
                onKeyDown: handleKeyDown,
                className: cn(styles.resizeHandleGrip, className),
                ...componentProps,
            },
        });

        return (
            <div {...sideProps} onPointerDown={handlePointerDown} className={styles.resizeHandle}>
                {grip}
            </div>
        );
    },
);
SheetResizeHandle.displayName = 'Sheet.ResizeHandle';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Header
 * -----------------------------------------------------------------------------------------------*/

export const SheetHeader = forwardRef<HTMLDivElement, SheetHeader.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <Dialog.Header ref={ref} className={cn(styles.header, className)} {...componentProps} />;
});
SheetHeader.displayName = 'Sheet.Header';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Body
 * -----------------------------------------------------------------------------------------------*/

export const SheetBody = forwardRef<HTMLDivElement, SheetBody.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <Dialog.Body ref={ref} className={cn(styles.body, className)} {...componentProps} />;
});
SheetBody.displayName = 'Sheet.Body';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Footer
 * -----------------------------------------------------------------------------------------------*/

export const SheetFooter = forwardRef<HTMLDivElement, SheetFooter.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <Dialog.Footer ref={ref} className={cn(styles.footer, className)} {...componentProps} />;
});
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
    export type State = {};
    export interface Props extends Omit<Dialog.Root.Props, 'size'> {}

    export type ChangeEventDetails = BaseDialog.Root.ChangeEventDetails;
    export type Actions = BaseDialog.Root.Actions;
}

export namespace SheetTrigger {
    export type State = Dialog.Trigger.State;
    export type Props = VaporUIComponentProps<typeof Dialog.Trigger, State>;
}

export namespace SheetClose {
    export type State = Dialog.Close.State;
    export type Props = VaporUIComponentProps<typeof Dialog.Close, State>;
}

export namespace SheetOverlayPrimitive {
    export type State = Dialog.OverlayPrimitive.State;
    export type Props = VaporUIComponentProps<typeof Dialog.OverlayPrimitive, State>;
}

export namespace SheetPortalPrimitive {
    export type State = Dialog.PortalPrimitive.State;
    export type Props = VaporUIComponentProps<typeof Dialog.PortalPrimitive, State>;
}

export interface SheetPositionerPrimitiveState {
    /** The side of the sheet relative to the viewport. */
    side?: 'top' | 'right' | 'bottom' | 'left';

    /** Whether the sheet is open. */
    open: boolean;

    /** Whether the sheet is closed. */
    closed: boolean;
}

export namespace SheetPositionerPrimitive {
    export type State = SheetPositionerPrimitiveState;
    export type Props = VaporUIComponentProps<'div', State> & PositionerType;
}

export namespace SheetPopupPrimitive {
    export type State = BaseDialog.Popup.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Popup, State>;
}

export interface SheetPopupProps extends SheetPopupPrimitive.Props {
    /**
     * A Custom element for Sheet.PortalPrimitive. If not provided, the default Sheet.PortalPrimitive will be rendered.
     */
    portalElement?: ReactElement<SheetPortalPrimitive.Props>;
    /**
     * A Custom element for Sheet.OverlayPrimitive. If not provided, the default Sheet.OverlayPrimitive will be rendered.
     */
    overlayElement?: ReactElement<SheetOverlayPrimitive.Props>;
    /**
     * A Custom element for Sheet.PositionerPrimitive. If not provided, the default Sheet.PositionerPrimitive will be rendered.
     */
    positionerElement?: ReactElement<SheetPositionerPrimitive.Props>;
}

export namespace SheetPopup {
    export type State = SheetPopupPrimitive.State;
    export type Props = SheetPopupProps;
}

export interface SheetResizeHandleState {
    /** The side of the sheet relative to the viewport. */
    side: 'top' | 'right' | 'bottom' | 'left';

    /** Whether resizing is disabled. */
    disabled: boolean;
}

export namespace SheetResizeHandle {
    export type State = SheetResizeHandleState;
    export interface Props extends VaporUIComponentProps<'div', State> {
        /**
         * Pixels adjusted per arrow-key press.
         * @default 16
         */
        step?: number;
        /**
         * Blocks drag and keyboard resizing.
         */
        disabled?: boolean;
    }
}

export namespace SheetHeader {
    export type State = Dialog.Header.State;
    export type Props = VaporUIComponentProps<typeof Dialog.Header, State>;
}

export namespace SheetBody {
    export type State = Dialog.Body.State;
    export type Props = VaporUIComponentProps<typeof Dialog.Body, State>;
}

export namespace SheetFooter {
    export type State = Dialog.Footer.State;
    export type Props = VaporUIComponentProps<typeof Dialog.Footer, State>;
}

export namespace SheetTitle {
    export type State = Dialog.Title.State;
    export type Props = VaporUIComponentProps<typeof Dialog.Title, State>;
}

export namespace SheetDescription {
    export type State = Dialog.Description.State;
    export type Props = VaporUIComponentProps<typeof Dialog.Description, State>;
}
