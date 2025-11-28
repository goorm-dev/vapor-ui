'use client';

import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './dialog.css';
import type { DialogPopupVariants } from './dialog.css';

type DialogVariants = DialogPopupVariants;
type DialogSharedProps = DialogVariants;

type DialogContext = DialogSharedProps;

const [DialogProvider, useDialogContext] = createContext<DialogContext>({
    name: 'Dialog',
    hookName: 'useDialogContext',
    providerName: 'DialogProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Dialog
 * -----------------------------------------------------------------------------------------------*/

/**
 * 사용자 상호작용을 위한 모달 다이얼로그 컴포넌트
 */
export const DialogRoot = ({ size, closeOnClickOverlay, children, ...props }: DialogRoot.Props) => {
    return (
        <DialogProvider value={{ size }}>
            <BaseDialog.Root dismissible={closeOnClickOverlay} {...props}>
                {children}
            </BaseDialog.Root>
        </DialogProvider>
    );
};

DialogRoot.applyName = 'Dialog.Root';
/* -------------------------------------------------------------------------------------------------
 * Dialog.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

/** 다이얼로그 포털 프리미티브 */
export const DialogPortalPrimitive = BaseDialog.Portal;

/* -------------------------------------------------------------------------------------------------
 * Dialog.OverlayPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 배경 오버레이 프리미티브
 */
export const DialogOverlayPrimitive = forwardRef<HTMLDivElement, DialogOverlayPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseDialog.Backdrop
                ref={ref}
                className={clsx(styles.overlay, className)}
                {...componentProps}
            />
        );
    },
);
DialogOverlayPrimitive.displayName = 'Dialog.OverlayPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Dialog.PopupPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 팝업 프리미티브
 */
export const DialogPopupPrimitive = forwardRef<HTMLDivElement, DialogPopupPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { size } = useDialogContext();

        return (
            <BaseDialog.Popup
                ref={ref}
                className={clsx(styles.popup({ size }), className)}
                {...componentProps}
            />
        );
    },
);
DialogPopupPrimitive.displayName = 'Dialog.PopupPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 팝업 컴포넌트
 */
export const DialogPopup = forwardRef<HTMLDivElement, DialogPopup.Props>((props, ref) => {
    const { portalElement, overlayElement, ...componentProps } = resolveStyles(props);

    const PortalElement = createSlot(portalElement || <DialogPortalPrimitive />);
    const DialogOverlayPrimitiveElement = createSlot(overlayElement || <DialogOverlayPrimitive />);

    return (
        <PortalElement>
            <DialogOverlayPrimitiveElement />
            <DialogPopupPrimitive ref={ref} {...componentProps} />
        </PortalElement>
    );
});
DialogPopup.displayName = 'Dialog.Popup';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 열기 트리거
 */
export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseDialog.Trigger ref={ref} {...componentProps} />;
});
DialogTrigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 닫기 버튼
 */
export const DialogClose = forwardRef<HTMLButtonElement, DialogClose.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseDialog.Close ref={ref} {...componentProps} />;
});
DialogClose.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 제목
 */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitle.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseDialog.Title ref={ref} className={clsx(styles.title, className)} {...componentProps} />
    );
});
DialogTitle.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 설명
 */
export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescription.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseDialog.Description
                ref={ref}
                className={clsx(styles.description, className)}
                {...componentProps}
            />
        );
    },
);
DialogDescription.displayName = 'Dialog.Description';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Header
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 헤더 영역
 */
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeader.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.header, className),
            ...componentProps,
        },
    });
});
DialogHeader.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 본문 영역
 */
export const DialogBody = forwardRef<HTMLDivElement, DialogBody.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.body, className),
            ...componentProps,
        },
    });
});
DialogBody.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그 푸터 영역
 */
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooter.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.footer, className),
            ...componentProps,
        },
    });
});
DialogFooter.displayName = 'Dialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export namespace DialogRoot {
    type DialogPrimitiveProps = Omit<VComponentProps<typeof BaseDialog.Root>, 'dismissible'>;
    export interface Props extends DialogPrimitiveProps, DialogSharedProps {
        /** 오버레이 클릭 시 닫기 여부 */
        closeOnClickOverlay?: boolean;
    }
    export type ChangeEventDetails = BaseDialog.Root.ChangeEventDetails;
}

export namespace DialogPortalPrimitive {
    export interface Props extends VComponentProps<typeof BaseDialog.Portal> {}
}

export namespace DialogOverlayPrimitive {
    export interface Props extends VComponentProps<typeof BaseDialog.Backdrop> {}
}

export namespace DialogPopupPrimitive {
    export interface Props extends VComponentProps<typeof BaseDialog.Popup> {}
}

export namespace DialogPopup {
    export interface Props extends DialogPopupPrimitive.Props {
        portalElement?: ReactElement<typeof DialogPortalPrimitive>;
        overlayElement?: ReactElement<typeof DialogOverlayPrimitive>;
    }
}

export namespace DialogTrigger {
    export interface Props extends VComponentProps<typeof BaseDialog.Trigger> {}
}

export namespace DialogClose {
    export interface Props extends VComponentProps<typeof BaseDialog.Close> {}
}

export namespace DialogTitle {
    export interface Props extends VComponentProps<typeof BaseDialog.Title> {}
}

export namespace DialogDescription {
    export interface Props extends VComponentProps<typeof BaseDialog.Description> {}
}

export namespace DialogHeader {
    export interface Props extends VComponentProps<'div'> {}
}

export namespace DialogBody {
    export interface Props extends VComponentProps<'div'> {}
}

export namespace DialogFooter {
    export interface Props extends VComponentProps<'div'> {}
}
