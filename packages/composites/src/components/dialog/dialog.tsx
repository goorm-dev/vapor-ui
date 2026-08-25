'use client';

import type { ReactNode } from 'react';
import {
    createContext,
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
    ariaLabels: Dialog.Props['ariaLabels'];
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

export const Dialog = ({
    // functional
    open,
    defaultOpen,
    onOpenChange,
    actionsRef: actionsRefProp,
    container,
    keepMounted,
    ariaLabels,

    // variants
    size,

    // slots
    title,
    description,
    trigger,
    assistive,
    action,
    children,
}: Dialog.Props) => {
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

                    <DialogPrimitives.PopupPrimitive>
                        <Header title={title} description={description} />
                        <Body>{children}</Body>
                        <Footer action={action} assistive={assistive} />
                    </DialogPrimitives.PopupPrimitive>
                </DialogPrimitives.PortalPrimitive>
            </DialogPrimitives.Root>
        </DialogContext.Provider>
    );
};

type Slots = SlotProps<typeof slots, 'title'>;
type AriaLabels = AriaLabelProps<'close'>;
type RootProps = DialogPrimitives.Root.Props;
type PortalProps = DialogPrimitives.PortalPrimitive.Props;

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
     * 다이얼로그의 보조 액션. `close` 함수를 render prop으로 전달 받을 수 있다.
     * @example
     * // #1
     * <Dialog.Root assistive={<Dialog.Assistive>취소</Dialog.Assistive>} />
     * // #2
     * <Dialog.Root assistive={(close) => <Dialog.Assistive onClick={() => close()} />} />
     */
    assistive?: Slots['assistive'];

    /**
     * 다이얼로그의 주요 액션. `close` 함수를 render prop으로 전달 받을 수 있다.
     * @example
     * // #1
     * <Dialog.Root action={<Dialog.Action>취소</Dialog.Action>} />
     * // #2
     * <Dialog.Root action={(close) => <Dialog.Action onClick={() => close()} />} />
     */
    action?: Slots['action'];

    /**
     * 다이얼로그의 본문에 해당한다.
     */
    children?: ReactNode;
}

export namespace Dialog {
    export type Actions = DialogPrimitives.Root.Actions;
    export type Props = DialogProps;
}

/* -----------------------------------------------------------------------------------------------*/

interface HeaderProps extends Pick<Dialog.Props, 'title' | 'description'> {}

const Header = ({ title, description }: HeaderProps) => {
    return (
        <DialogPrimitives.Header
            $css={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr 28px',
                height: 'unset',
                paddingTop: '$300',
                gap: '$200',
            }}
        >
            <VStack $css={{ alignItems: 'flex-start', gap: '$025', flex: 1 }}>
                <slots.title render={title} />
                <slots.description render={description} $css={{ color: '$basic-gray-500' }} />
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
        marginTop: '$200',
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

interface FooterProps extends Pick<Dialog.Props, 'action' | 'assistive'> {}

const Footer = ({ action, assistive }: FooterProps) => {
    const renderFooter = action || assistive;

    return (
        <DialogPrimitives.Footer
            $css={{
                display: 'grid',
                gridTemplateAreas: '"assistive action"',
                paddingTop: renderFooter ? '$200' : '$000',
                paddingBottom: '$300',
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

export const DialogAction = ({
    closeOnClick = true,
    onClick,
    children,
    ...props
}: DialogAction.Props) => {
    const { close } = useDialogContext();
    const handleClick = (event: Parameters<NonNullable<Button.Props['onClick']>>[0]) => {
        onClick?.(event);

        if (event.defaultPrevented) return;
        if (!closeOnClick) return;
        close();
    };

    return (
        <Button size="lg" colorPalette="primary" onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};

interface DialogActionProps extends Button.Props {
    /**
     * 클릭 시 다이얼로그를 자동으로 닫을지 여부.
     * @default true
     */
    closeOnClick?: boolean;
}

export namespace DialogAction {
    export type Props = DialogActionProps;
}

/* -----------------------------------------------------------------------------------------------*/

export const DialogAssistive = ({
    closeOnClick = true,
    onClick,
    children,
    ...props
}: DialogAssistive.Props) => {
    const { close } = useDialogContext();
    const handleClick = (event: Parameters<NonNullable<Button.Props['onClick']>>[0]) => {
        onClick?.(event);

        if (event.defaultPrevented) return;
        if (!closeOnClick) return;
        close();
    };

    return (
        <Button
            size="lg"
            colorPalette="secondary"
            variant="outline"
            onClick={handleClick}
            {...props}
        >
            {children}
        </Button>
    );
};

interface DialogAssistiveProps extends Button.Props {
    /**
     * 클릭 시 다이얼로그를 자동으로 닫을지 여부.
     * @default true
     */
    closeOnClick?: boolean;
}

export namespace DialogAssistive {
    export type Props = DialogAssistiveProps;
}
