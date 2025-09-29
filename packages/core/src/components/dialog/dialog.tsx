'use client';

import { forwardRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { VComponentProps } from '~/utils/types';

import * as styles from './dialog.css';
import type { DialogContentVariants } from './dialog.css';

type DialogVariants = DialogContentVariants;
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
 * 다이얼로그 컴포넌트의 루트 컨테이너로, 다이얼로그의 열림/닫힘 상태를 관리하고 컨텍스트를 제공합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/dialog Dialog Documentation}
 */
type DialogPrimitiveProps = Omit<VComponentProps<typeof BaseDialog.Root>, 'dismissible'>;
interface DialogRootProps extends DialogPrimitiveProps, DialogSharedProps {
    closeOnClickOverlay?: boolean;
}

const Root = ({ size, closeOnClickOverlay, children, ...props }: DialogRootProps) => {
    return (
        <DialogProvider value={{ size }}>
            <BaseDialog.Root dismissible={closeOnClickOverlay} {...props}>
                {children}
            </BaseDialog.Root>
        </DialogProvider>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Dialog.Portal
 * -----------------------------------------------------------------------------------------------*/

/**
 * 팝업을 DOM의 다른 부분으로 이동시키는 포털 요소입니다. 기본적으로 포털 요소는 <body>에 추가됩니다.
 */
interface DialogPortalProps extends VComponentProps<typeof BaseDialog.Portal> {}

const Portal = BaseDialog.Portal;

/* -------------------------------------------------------------------------------------------------
 * Dialog.Overlay
 * -----------------------------------------------------------------------------------------------*/

/**
 * 팝업 아래에 표시되는 오버레이.
 *
 * `<div>` 요소를 렌더링합니다.
 */
interface DialogOverlayProps extends VComponentProps<typeof BaseDialog.Backdrop> {}

const Overlay = forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, ...props }, ref) => {
    return <BaseDialog.Backdrop ref={ref} className={clsx(styles.overlay, className)} {...props} />;
});
Overlay.displayName = 'Dialog.Overlay';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Popup
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그의 메인 팝업 컨테이너로, 크기 변형에 따라 너비가 조정됩니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
interface DialogPopupProps extends VComponentProps<typeof BaseDialog.Popup> {}

const Popup = forwardRef<HTMLDivElement, DialogPopupProps>(({ className, ...props }, ref) => {
    const { size } = useDialogContext();

    return (
        <BaseDialog.Popup
            ref={ref}
            className={clsx(styles.content({ size }), className)}
            {...props}
        />
    );
});
Popup.displayName = 'Dialog.Popup';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Content
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그의 전체 콘텐츠를 포함하는 편의 컴포넌트로, Portal, Overlay, Popup을 한 번에 렌더링합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
interface DialogContentProps extends DialogPopupProps {
    portalProps?: DialogPortalProps;
    overlayProps?: DialogOverlayProps;
}

const Content = forwardRef<HTMLDivElement, DialogContentProps>(
    ({ portalProps, overlayProps, ...props }, ref) => {
        return (
            <Portal {...portalProps}>
                <Overlay {...overlayProps} />
                <Popup ref={ref} {...props} />
            </Portal>
        );
    },
);
Content.displayName = 'Dialog.Content';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그를 열기 위한 트리거 버튼입니다.
 *
 * `<button>` 요소를 렌더링합니다.
 */
interface DialogTriggerProps extends VComponentProps<typeof BaseDialog.Trigger> {}

const Trigger = forwardRef<HTMLButtonElement, DialogTriggerProps>((props, ref) => {
    return <BaseDialog.Trigger ref={ref} aria-controls={undefined} {...props} />;
});
Trigger.displayName = 'Dialog.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Close
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그를 닫기 위한 버튼입니다.
 *
 * `<button>` 요소를 렌더링합니다.
 */
interface DialogCloseProps extends VComponentProps<typeof BaseDialog.Close> {}

const Close = forwardRef<HTMLButtonElement, DialogCloseProps>((props, ref) => {
    return <BaseDialog.Close ref={ref} {...props} />;
});
Close.displayName = 'Dialog.Close';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Title
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그의 제목을 표시하는 컴포넌트입니다.
 *
 * `<h2>` 요소를 렌더링합니다.
 */
interface DialogTitleProps extends VComponentProps<typeof BaseDialog.Title> {}

const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, ...props }, ref) => {
    return <BaseDialog.Title ref={ref} className={clsx(styles.title, className)} {...props} />;
});
Title.displayName = 'Dialog.Title';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그의 설명 텍스트를 표시하는 컴포넌트입니다.
 *
 * `<p>` 요소를 렌더링합니다.
 */
interface DialogDescriptionProps extends VComponentProps<typeof BaseDialog.Description> {}

const Description = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
    ({ className, ...props }, ref) => {
        return (
            <BaseDialog.Description
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

/**
 * 다이얼로그의 헤더 영역으로, 제목과 닫기 버튼을 포함합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
interface DialogHeaderProps extends VComponentProps<'div'> {}

const Header = forwardRef<HTMLDivElement, DialogHeaderProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.header, className),
                ...props,
            },
        });
    },
);
Header.displayName = 'Dialog.Header';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그의 메인 콘텐츠 영역으로, 스크롤 가능한 영역입니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
interface DialogBodyProps extends VComponentProps<'div'> {}

const Body = forwardRef<HTMLDivElement, DialogBodyProps>(({ render, className, ...props }, ref) => {
    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.body, className),
            ...props,
        },
    });
});
Body.displayName = 'Dialog.Body';

/* -------------------------------------------------------------------------------------------------
 * Dialog.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * 다이얼로그의 푸터 영역으로, 액션 버튼들을 포함합니다.
 *
 * `<div>` 요소를 렌더링합니다.
 */
interface DialogFooterProps extends VComponentProps<'div'> {}

const Footer = forwardRef<HTMLDivElement, DialogFooterProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.footer, className),
                ...props,
            },
        });
    },
);
Footer.displayName = 'Dialog.Footer';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as DialogRoot,
    Portal as DialogPortal,
    Overlay as DialogOverlay,
    Popup as DialogPopup,
    Content as DialogContent,
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
    DialogPopupProps,
    DialogContentProps,
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
    Overlay,
    Popup,
    Content,
    Portal,
    Trigger,
    Close,
    Title,
    Description,
    Header,
    Body,
    Footer,
};
