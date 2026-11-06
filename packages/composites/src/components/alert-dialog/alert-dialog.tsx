import { createContext, forwardRef, useCallback, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

import { AlertDialog as AlertDialogPrimitives, Button, VStack } from '@vapor-ui/core';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

export interface AlertDialogContext {
    close: () => void;
    type: AlertDialogRoot.Props['type'];
}

export const AlertDialogContext = createContext<AlertDialogContext | undefined>(undefined);

export function useAlertDialogContext() {
    const context = useContext<AlertDialogContext | undefined>(AlertDialogContext);
    if (context === undefined) {
        throw new Error(
            'AlertDialogContext is missing. AlertDialog parts must be placed within <AlertDialog.Root>.',
        );
    }
    return context;
}

/* -----------------------------------------------------------------------------------------------*/

const slots = createSlots({
    title: AlertDialogPrimitives.Title,
    trigger: AlertDialogPrimitives.Trigger,
    description: AlertDialogPrimitives.Description,
    cancel: Button,
    action: Button,
});

export const AlertDialogRoot = forwardRef<HTMLDivElement, AlertDialogRoot.Props>((props, ref) => {
    const {
        // functions
        open,
        onOpenChange,
        defaultOpen,
        actionsRef: actionsRefProp,
        container,
        keepMounted,

        // DOM
        id,
        className,

        // variants
        type,

        // slots
        trigger,

        title,
        description,
        cancel,
        action,
        children,
    } = props;

    const fallbackActionsRef = useRef<AlertDialogPrimitives.Root.Actions>(null);
    const actionsRef = actionsRefProp ?? fallbackActionsRef;
    const close = useCallback(() => actionsRef.current?.close(), [actionsRef]);

    const context = useMemo<AlertDialogContext>(() => ({ close, type }), [close, type]);

    return (
        <AlertDialogContext.Provider value={context}>
            <AlertDialogPrimitives.Root
                open={open}
                onOpenChange={onOpenChange}
                defaultOpen={defaultOpen}
                actionsRef={actionsRef}
            >
                <slots.trigger render={trigger} />

                <AlertDialogPrimitives.PortalPrimitive
                    container={container}
                    keepMounted={keepMounted}
                >
                    <AlertDialogPrimitives.OverlayPrimitive />
                    <AlertDialogPrimitives.PopupPrimitive ref={ref} id={id} className={className}>
                        <Header title={title} description={description} />
                        <Body>{children}</Body>
                        <Footer action={action} cancel={cancel} />
                    </AlertDialogPrimitives.PopupPrimitive>
                </AlertDialogPrimitives.PortalPrimitive>
            </AlertDialogPrimitives.Root>
        </AlertDialogContext.Provider>
    );
});
AlertDialogRoot.displayName = 'AlertDialog.Root';

type Slots = SlotProps<typeof slots, 'title'>;
type RootProps = AlertDialogPrimitives.Root.Props;
type PortalProps = AlertDialogPrimitives.PortalPrimitive.Props;
type PopupProps = AlertDialogPrimitives.PopupPrimitive.Props;

export interface AlertDialogProps {
    /**
     * 다이얼로그 열림 상태(제어). 사용자가 결정을 내려야 하는 시점을 외부 상태로 동기화할 때 사용한다.
     * 상태의 변경을 추적할 필요가 없다면 defaultOpen을 사용한다.
     */
    open?: RootProps['open'];

    /**
     * 마운트 시 초기 열림 여부(비제어).
     * @default false
     */
    defaultOpen?: RootProps['defaultOpen'];

    /**
     * 열림 상태 변경 콜백. 트리거·오버레이·ESC 등 모든 닫힘 경로에서 호출된다.
     * @example
     * <AlertDialog.Root onOpenChange={(open) => setOpen(open)} />
     */
    onOpenChange?: RootProps['onOpenChange'];

    /**
     * 다이얼로그를 조작하기 위한 ref를 지정한다.
     * @example
     * const actionsRef = useRef<AlertDialog.Actions>(null);
     * const handleSave = async (event: MouseEvent<HTMLButtonElement>) => {
     *     event.preventDefault();
     *
     *     await save();
     *     actionsRef.current?.close();
     * };
     * <AlertDialog.Root actionsRef={actionsRef} action={<AlertDialog.Action onClick={handleSave} />} />
     */
    actionsRef?: RootProps['actionsRef'];

    /**
     * Portal 대상 컨테이너. SSR·shadow DOM·특정 스택 컨텍스트에서 오버레이 위치 제어가 필요할 때만 지정한다.
     * @default document.body
     */
    container?: PortalProps['container'];

    /**
     * 닫힘 시에도 DOM에 유지할지 여부. 애니메이션/폼 상태 보존이 필요한 경우 true.
     * @default false
     */
    keepMounted?: PortalProps['keepMounted'];

    /**
     * 다이얼로그의 타입을 결정한다.
     * @default "critical"
     */
    type: 'critical' | 'confirm';

    /**
     * Popup DOM 노드의 id. aria-controls 연결, QA selector 등에 사용한다.
     *
     * 기본값 `keepMounted: false`에서는 다이얼로그가 닫힌 동안 Popup이 언마운트되므로,
     * 같은 조건에서 `ref.current`는 `null`이다.
     */
    id?: PopupProps['id'];

    /**
     * Popup DOM 노드의 className.
     */
    className?: PopupProps['className'];

    /**
     * 다이얼로그의 목적을 한 문장으로 전달한다.
     */
    title: Slots['title'];

    /**
     * 결정에 필요한 부가 설명.
     */
    description: Slots['description'];

    /**
     * 다이얼로그를 여는 진입 요소.
     * @example
     * <AlertDialog.Root trigger={<Button>열기</Button>} />
     */
    trigger?: Slots['trigger'];

    /**
     * 다이얼로그의 보조 액션 요소.
     * @example
     * <AlertDialog.Root cancel={<AlertDialog.Cancel>취소</Dialog.Cancel>} />
     */
    cancel: Slots['cancel'];

    /**
     * 다이얼로그의 주요 액션 요소.
     * @example
     * <AlertDialog.Root action={<AlertDialog.Action>삭제</Dialog.Action>} />
     */
    action: Slots['action'];

    /**
     * 다이얼로그의 본문에 해당한다.
     */
    children?: ReactNode;
}

export namespace AlertDialogRoot {
    export type ChangeEventDetails = AlertDialogPrimitives.Root.ChangeEventDetails;
    export type Actions = AlertDialogPrimitives.Root.Actions;
    export type Props = AlertDialogProps;
}

/* -----------------------------------------------------------------------------------------------*/

interface HeaderProps extends Pick<AlertDialogRoot.Props, 'title' | 'description'> {}

const Header = ({ title, description }: HeaderProps) => {
    return (
        <AlertDialogPrimitives.Header render={<VStack />} $css={{ gap: '$200' }}>
            <VStack $css={{ gap: '$075' }}>
                <slots.title render={title} />
                <slots.description render={description} />
            </VStack>
        </AlertDialogPrimitives.Header>
    );
};

/* -----------------------------------------------------------------------------------------------*/

interface BodyProps extends Pick<AlertDialogRoot.Props, 'children'> {}

const Body = ({ children }: BodyProps) => {
    if (children === null || children === undefined) return null;
    // if (!children) return null;

    return <AlertDialogPrimitives.Body>{children}</AlertDialogPrimitives.Body>;
};

/* -----------------------------------------------------------------------------------------------*/

interface FooterProps extends Pick<AlertDialogRoot.Props, 'action' | 'cancel'> {}

const Footer = ({ action, cancel }: FooterProps) => {
    return (
        <AlertDialogPrimitives.Footer
            $css={{
                display: 'grid',
                gap: '$100',
                gridTemplateAreas: '"cancel action"',
            }}
        >
            <slots.cancel render={cancel} $css={{ gridArea: 'cancel' }} />
            <slots.action render={action} $css={{ gridArea: 'action' }} />
        </AlertDialogPrimitives.Footer>
    );
};

/* -----------------------------------------------------------------------------------------------*/

export const AlertDialogAction = forwardRef<HTMLElement, AlertDialogAction.Props>((props, ref) => {
    const { id, isDisabled, closeOnClick = true, className, onClick, children } = props;

    const { close, type } = useAlertDialogContext();
    const handleClick = (event: Parameters<NonNullable<ButtonProps['onClick']>>[0]) => {
        onClick?.(event);

        if (event.defaultPrevented) return;
        if (!closeOnClick) return;
        close();
    };

    return (
        <Button
            ref={ref}
            id={id}
            size="lg"
            colorPalette={type === 'critical' ? 'danger' : 'primary'}
            disabled={isDisabled}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Button>
    );
});
AlertDialogAction.displayName = 'AlertDialog.Action';

interface AlertDialogActionProps {
    /**
     * Action DOM 노드의 id. aria-controls 연결, QA selector 등에 사용한다.
     */
    id?: ButtonProps['id'];

    /**
     * 버튼을 비활성화한다. 비활성화된 버튼은 클릭 시 액션을 실행하지 않는다.
     * @default false
     */
    isDisabled?: ButtonProps['disabled'];

    /**
     * 클릭 시 다이얼로그를 자동으로 닫을지 여부.
     * @default true
     */
    closeOnClick?: boolean;

    /**
     * Action DOM 노드에 추가할 className.
     */
    className?: ButtonProps['className'];

    /**
     * 버튼 클릭 시 호출되는 이벤트 핸들러.
     * @example
     * <AlertDialog.Action onClick={handleDelete}>삭제</AlertDialog.Action>
     */
    onClick?: ButtonProps['onClick'];

    /**
     * 버튼 내부에 표시할 요소. 보통 주요 액션을 설명하는 짧은 라벨 텍스트를 넣는다.
     */
    children: ButtonProps['children'];
}

export namespace AlertDialogAction {
    export type Props = AlertDialogActionProps;
}

/* -----------------------------------------------------------------------------------------------*/

export const AlertDialogCancel = forwardRef<HTMLElement, AlertDialogCancel.Props>((props, ref) => {
    const { id, isDisabled, closeOnClick = true, className, onClick, children } = props;

    const { close } = useAlertDialogContext();
    const handleClick = useCallback(
        (event: Parameters<NonNullable<ButtonProps['onClick']>>[0]) => {
            onClick?.(event);

            if (event.defaultPrevented) return;
            if (!closeOnClick) return;
            close();
        },
        [close, closeOnClick, onClick],
    );

    return (
        <Button
            ref={ref}
            id={id}
            size="lg"
            colorPalette="secondary"
            disabled={isDisabled}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Button>
    );
});
AlertDialogCancel.displayName = 'AlertDialog.Cancel';

interface AlertDialogCancelProps {
    /**
     * Cancel DOM 노드의 id. aria-controls 연결, QA selector 등에 사용한다.
     */
    id?: ButtonProps['id'];

    /**
     * 버튼을 비활성화한다. 비활성화된 버튼은 클릭 시 액션을 실행하지 않는다.
     * @default false
     */
    isDisabled?: ButtonProps['disabled'];

    /**
     * 클릭 시 다이얼로그를 자동으로 닫을지 여부.
     * @default true
     */
    closeOnClick?: boolean;

    /**
     * Cancel DOM 노드에 추가할 className.
     */
    className?: ButtonProps['className'];

    /**
     * 버튼 클릭 시 호출되는 이벤트 핸들러.
     * @example
     * <AlertDialog.Cancel onClick={handleCancel}>취소</AlertDialog.Cancel>
     */
    onClick?: ButtonProps['onClick'];

    /**
     * 버튼 내부에 표시할 요소. 보통 취소 액션을 설명하는 짧은 라벨 텍스트를 넣는다.
     */
    children: ButtonProps['children'];
}

export namespace AlertDialogCancel {
    export type Props = AlertDialogCancelProps;
}

/* -----------------------------------------------------------------------------------------------*/

type ButtonProps = Button.Props;
