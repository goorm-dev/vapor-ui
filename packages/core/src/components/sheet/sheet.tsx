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

export const SheetPopup = forwardRef<HTMLDivElement, SheetPopup.Props>(
    ({ portalElement, overlayElement, positionerElement, ...props }, ref) => {
        const popup = <SheetPopupPrimitive ref={ref} {...props} />;

        const positionerRender = createRender(positionerElement, <SheetPositionerPrimitive />);
        const positioner = useRender({
            render: positionerRender,
            props: { children: popup },
        });

        const overlayRender = createRender(overlayElement, <SheetOverlayPrimitive />);
        const overlay = useRender({
            render: overlayRender,
        });

        const portalRender = createRender(portalElement, <SheetPortalPrimitive />);
        const portal = useRender({
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
 * Sheet.Header
 * -----------------------------------------------------------------------------------------------*/

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

export const SheetBody = forwardRef<HTMLDivElement, SheetBody.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <Dialog.Body ref={ref} className={clsx(styles.body, className)} {...componentProps} />;
});
SheetBody.displayName = 'Sheet.Body';

/* -------------------------------------------------------------------------------------------------
 * Sheet.Footer
 * -----------------------------------------------------------------------------------------------*/

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
    export type Props = Omit<Dialog.Root.Props, 'size'>;

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

export namespace SheetPositionerPrimitive {
    export type State = {};
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
