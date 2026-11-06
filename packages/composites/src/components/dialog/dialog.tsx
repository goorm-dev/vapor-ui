'use client';

import type { ReactNode } from 'react';
import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { Button, Dialog as DialogPrimitives, IconButton, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';
import type { AriaLabelProps } from '~/utils/types';

export interface DialogContext {
    close: () => void;
    ariaLabels: DialogRoot.Props['ariaLabels'];
}

export const DialogContext = createContext<DialogContext | undefined>(undefined);

export function useDialogContext() {
    const context = useContext<DialogContext | undefined>(DialogContext);
    if (context === undefined) {
        throw new Error(
            'DialogContext is missing. Dialog parts must be placed within <Dialog.Root>.',
        );
    }
    return context;
}

/* -----------------------------------------------------------------------------------------------*/

const slots = createSlots({
    title: DialogPrimitives.Title,
    trigger: DialogPrimitives.Trigger,
    description: DialogPrimitives.Description,
    assistive: Button,
    action: Button,
});

export const DialogRoot = forwardRef<HTMLDivElement, DialogRoot.Props>((props, ref) => {
    const {
        // functional
        open,
        defaultOpen,
        onOpenChange,
        actionsRef: actionsRefProp,
        container,
        keepMounted,
        ariaLabels,

        // DOM
        id,
        className,

        // variants
        size,

        // slots
        title,
        description,
        trigger,
        assistive,
        action,
        children,
    } = props;

    const actionsRef = useRef<DialogPrimitives.Root.Actions>(null);
    const mergedRef = actionsRefProp ?? actionsRef;
    const close = useCallback(() => mergedRef.current?.close(), [mergedRef]);

    const context = useMemo<DialogContext>(() => ({ close, ariaLabels }), [close, ariaLabels]);

    return (
        <DialogContext.Provider value={context}>
            <DialogPrimitives.Root
                open={open}
                defaultOpen={defaultOpen}
                onOpenChange={onOpenChange}
                actionsRef={mergedRef}
                size={size}
            >
                <slots.trigger render={trigger} />

                <DialogPrimitives.PortalPrimitive container={container} keepMounted={keepMounted}>
                    <DialogPrimitives.OverlayPrimitive />

                    <DialogPrimitives.PopupPrimitive ref={ref} id={id} className={className}>
                        <Header title={title} description={description} />
                        <Body>{children}</Body>
                        <Footer action={action} assistive={assistive} />
                    </DialogPrimitives.PopupPrimitive>
                </DialogPrimitives.PortalPrimitive>
            </DialogPrimitives.Root>
        </DialogContext.Provider>
    );
});
DialogRoot.displayName = 'Dialog.Root';

type Slots = SlotProps<typeof slots, 'title'>;
type AriaLabels = AriaLabelProps<'close'>;
type RootProps = DialogPrimitives.Root.Props;
type PortalProps = DialogPrimitives.PortalPrimitive.Props;
type PopupProps = DialogPrimitives.PopupPrimitive.Props;

export interface DialogProps {
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
     * <Dialog.Root onOpenChange={(open) => setOpen(open)} />
     */
    onOpenChange?: RootProps['onOpenChange'];

    /**
     * 다이얼로그를 조작하기 위한 ref를 지정한다.
     * @example
     * const actionsRef = useRef<Dialog.Actions>(null);
     * const handleSave = async (event: MouseEvent<HTMLButtonElement>) => {
     *     event.preventDefault();
     *
     *     await save();
     *     actionsRef.current?.close();
     * };
     * <Dialog.Root actionsRef={actionsRef} action={<Dialog.Action onClick={handleSave} />} />
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
     * 다이얼로그 내부 요소의 aria-label을 지정한다.
     * @example
     * <Dialog.Root ariaLabels={{ close: '닫기' }} />
     */
    ariaLabels: AriaLabels;

    /**
     * 다이얼로그의 크기를 변경한다.
     * @default "md"
     */
    size?: RootProps['size'];

    /**
     * Popup DOM 노드의 id. aria-controls 연결, QA selector 등에 사용한다.
     *
     * 기본값 `keepMounted: false`에서는 다이얼로그가 닫힌 동안 Popup이 언마운트되므로,
     * 같은 조건에서 `ref.current`는 `null`이다.
     */
    id?: PopupProps['id'];

    /**
     * Popup DOM 노드에 추가할 className.
     */
    className?: PopupProps['className'];

    /**
     * 다이얼로그의 목적을 한 문장으로 전달한다.
     */
    title: Slots['title'];

    /**
     * 결정에 필요한 부가 설명.
     */
    description?: Slots['description'];

    /**
     * 다이얼로그를 여는 진입 요소.
     * @example
     * <Dialog.Root trigger={<Button>열기</Button>} />
     */
    trigger?: Slots['trigger'];

    /**
     * 다이얼로그의 보조 액션 요소.
     * @example
     * <Dialog.Root assistive={<Dialog.Assistive>취소</Dialog.Assistive>} />
     */
    assistive?: Slots['assistive'];

    /**
     * 다이얼로그의 주요 액션 요소.
     * @example
     * <Dialog.Root action={<Dialog.Action>취소</Dialog.Action>} />
     */
    action?: Slots['action'];

    /**
     * 다이얼로그의 본문에 해당한다.
     */
    children?: ReactNode;
}

export namespace DialogRoot {
    export type Actions = DialogPrimitives.Root.Actions;
    export type Props = DialogProps;
}

/* -----------------------------------------------------------------------------------------------*/

interface HeaderProps extends Pick<DialogRoot.Props, 'title' | 'description'> {}

const Header = ({ title, description }: HeaderProps) => {
    return (
        <DialogPrimitives.Header
            $css={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 28px' }}
        >
            <VStack $css={{ alignItems: 'flex-start', gap: '$050', flex: 1 }}>
                <slots.title render={title} />
                <slots.description render={description} />
            </VStack>

            <CloseButton />
        </DialogPrimitives.Header>
    );
};

/* -----------------------------------------------------------------------------------------------*/

const CloseButton = () => {
    const { ariaLabels } = useDialogContext();
    const { close: closeLabel } = ariaLabels;

    return (
        <DialogPrimitives.Close
            aria-label={closeLabel}
            render={<IconButton size="xl" colorPalette="secondary" variant="ghost" />}
            $css={{ position: 'absolute', top: '$150', right: '$150' }}
        >
            <CloseOutlineIcon />
        </DialogPrimitives.Close>
    );
};

/* -----------------------------------------------------------------------------------------------*/

const Body = ({ $css: $cssProp, children, ...props }: DialogPrimitives.Body.Props) => {
    const bodyRef = useRef<HTMLDivElement>(null);
    const [overflowed, setOverflowed] = useState(false);

    useEffect(() => {
        const element = bodyRef.current;
        if (!element) return;

        setOverflowed(element.scrollHeight - element.clientHeight > 1);
    }, []);

    const $css = {
        maskImage: overflowed ? 'linear-gradient(to top, transparent 0, black 20px)' : '',
        paddingBottom: overflowed ? '$250' : '$000',
        ...$cssProp,
    } satisfies typeof $cssProp;

    if (!children) return null;

    return (
        <DialogPrimitives.Body ref={bodyRef} $css={$css} {...props}>
            {children}
        </DialogPrimitives.Body>
    );
};

/* -----------------------------------------------------------------------------------------------*/

interface FooterProps extends Pick<DialogRoot.Props, 'action' | 'assistive'> {}

const Footer = ({ action, assistive }: FooterProps) => {
    const renderFooter = action || assistive;

    return (
        <DialogPrimitives.Footer
            $css={{
                display: 'grid',
                gridTemplateAreas: '"assistive action"',
                paddingTop: renderFooter ? '$250' : '$000',
            }}
        >
            <slots.assistive
                render={assistive}
                $css={{ gridArea: 'assistive', justifySelf: 'flex-start' }}
            />
            <slots.action render={action} $css={{ gridArea: 'action', justifySelf: 'flex-end' }} />
        </DialogPrimitives.Footer>
    );
};

/* -----------------------------------------------------------------------------------------------*/

export const DialogAction = forwardRef<HTMLElement, DialogAction.Props>((props, ref) => {
    const { id, isDisabled, closeOnClick = true, className, onClick, children } = props;

    const { close } = useDialogContext();
    const handleClick = (event: Parameters<NonNullable<Button.Props['onClick']>>[0]) => {
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
            colorPalette="primary"
            disabled={isDisabled}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Button>
    );
});
DialogAction.displayName = 'Dialog.Action';

interface DialogActionProps {
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
     * <Dialog.Action onClick={handleConfirm}>확인</Dialog.Action>
     */
    onClick?: ButtonProps['onClick'];

    /**
     * 버튼 내부에 표시할 요소. 보통 액션을 설명하는 짧은 라벨 텍스트를 넣는다.
     */
    children: ButtonProps['children'];
}

export namespace DialogAction {
    export type Props = DialogActionProps;
}

/* -----------------------------------------------------------------------------------------------*/

export const DialogAssistive = forwardRef<HTMLElement, DialogAssistive.Props>((props, ref) => {
    const { id, isDisabled, closeOnClick = true, className, onClick, children } = props;

    const { close } = useDialogContext();
    const handleClick = (event: Parameters<NonNullable<Button.Props['onClick']>>[0]) => {
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
            colorPalette="secondary"
            variant="outline"
            disabled={isDisabled}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Button>
    );
});
DialogAssistive.displayName = 'Dialog.Assistive';

interface DialogAssistiveProps {
    /**
     * Assistive DOM 노드의 id. aria-controls 연결, QA selector 등에 사용한다.
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
     * Assistive DOM 노드에 추가할 className.
     */
    className?: ButtonProps['className'];

    /**
     * 버튼 클릭 시 호출되는 이벤트 핸들러.
     * @example
     * <Dialog.Assistive onClick={handleCancel}>취소</Dialog.Assistive>
     */
    onClick?: ButtonProps['onClick'];

    /**
     * 버튼 내부에 표시할 요소. 보통 보조 액션을 설명하는 짧은 라벨 텍스트를 넣는다.
     */
    children: ButtonProps['children'];
}

export namespace DialogAssistive {
    export type Props = DialogAssistiveProps;
}

/* -----------------------------------------------------------------------------------------------*/

type ButtonProps = Button.Props;
