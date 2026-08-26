import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

import { AlertDialog as AlertDialogPrimitives, Box, Button, VStack } from '@vapor-ui/core';

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
    icon: Box,
    title: AlertDialogPrimitives.Title,
    trigger: AlertDialogPrimitives.Trigger,
    description: AlertDialogPrimitives.Description,
    cancel: Button,
    action: Button,
});

export const AlertDialogRoot = ({
    // functions
    actionsRef: actionsRefProp,

    // variants
    type,

    // slots
    trigger,
    icon,
    title,
    description,
    cancel,
    action,
}: AlertDialogRoot.Props) => {
    const actionsRef = useRef<AlertDialogPrimitives.Root.Actions>(null);
    const mergedRef = actionsRefProp ?? actionsRef;
    const close = useCallback(() => mergedRef.current?.close(), [mergedRef]);

    const context = useMemo<AlertDialogContext>(() => ({ close, type }), [close, type]);

    return (
        <AlertDialogContext.Provider value={context}>
            <AlertDialogPrimitives.Root actionsRef={mergedRef}>
                <slots.trigger render={trigger} />

                <AlertDialogPrimitives.PortalPrimitive>
                    <AlertDialogPrimitives.OverlayPrimitive />
                    <AlertDialogPrimitives.PopupPrimitive>
                        <Body icon={icon} title={title} description={description} />
                        <Footer action={action} cancel={cancel} />
                    </AlertDialogPrimitives.PopupPrimitive>
                </AlertDialogPrimitives.PortalPrimitive>
            </AlertDialogPrimitives.Root>
        </AlertDialogContext.Provider>
    );
};

type Slots = SlotProps<typeof slots, 'title'>;
type RootProps = AlertDialogPrimitives.Root.Props;
type PortalProps = AlertDialogPrimitives.PortalPrimitive.Props;

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
     * @default "delete"
     */
    type: 'delete' | 'info';

    /**
     * 다이얼로그의 역할에 대한 시각적 힌트를 전달한다.
     */
    icon: Slots['icon'];

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
     * <AlertDialog.Root trigger={<Button>열기</Button>} />
     */
    trigger?: Slots['trigger'];

    /**
     * 다이얼로그의 보조 액션 요소.
     * @example
     * <AlertDialog.Root cancel={<AlertDialog.Cancel>취소</Dialog.Cancel>} />
     */
    cancel?: Slots['cancel'];

    /**
     * 다이얼로그의 주요 액션 요소.
     * @example
     * <AlertDialog.Root action={<AlertDialog.Action>취소</Dialog.Action>} />
     */
    action?: Slots['action'];

    /**
     * 다이얼로그의 본문에 해당한다.
     */
    children?: ReactNode;
}

export namespace AlertDialogRoot {
    export type Actions = AlertDialogPrimitives.Root.Actions;
    export type Props = AlertDialogProps;
}

/* -----------------------------------------------------------------------------------------------*/

const DEFAULT_ICON: Record<AlertDialogRoot.Props['type'], string> = {
    delete: 'https://statics.goorm.io/gds/resources/images/light/error_warning.svg',
    info: 'https://statics.goorm.io/gds/resources/images/light/confirm.svg',
};

interface BodyProps extends Pick<
    AlertDialogRoot.Props,
    'icon' | 'title' | 'description' | 'children'
> {}

const Body = ({ title, description, children }: BodyProps) => {
    const { type } = useAlertDialogContext();
    const icon = DEFAULT_ICON[type];

    return (
        <AlertDialogPrimitives.Body render={<VStack />} $css={{ gap: '$250' }}>
            <VStack $css={{ gap: '$150', alignItems: 'center' }}>
                <slots.icon
                    render={<img src={icon} alt="" />}
                    $css={{ width: '80px', height: '60px' }}
                />

                <VStack $css={{ gap: '$050', alignItems: 'center' }}>
                    <slots.title render={title} $css={{ textAlign: 'center' }} />
                    <slots.description render={description} $css={{ textAlign: 'center' }} />
                </VStack>
            </VStack>

            {children}
        </AlertDialogPrimitives.Body>
    );
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

export const AlertDialogAction = ({
    closeOnClick = true,
    onClick,
    children,
    ...props
}: AlertDialogAction.Props) => {
    const { close, type } = useAlertDialogContext();
    const handleClick = (event: Parameters<NonNullable<Button.Props['onClick']>>[0]) => {
        onClick?.(event);

        if (event.defaultPrevented) return;
        if (!closeOnClick) return;
        close();
    };

    return (
        <Button
            size="lg"
            colorPalette={type === 'delete' ? 'danger' : 'primary'}
            onClick={handleClick}
            {...props}
        >
            {children}
        </Button>
    );
};

interface AlertDialogActionProps extends Omit<Button.Props, 'size' | 'colorPalette' | 'variant'> {
    /**
     * 클릭 시 다이얼로그를 자동으로 닫을지 여부.
     * @default true
     */
    closeOnClick?: boolean;
}

export namespace AlertDialogAction {
    export type Props = AlertDialogActionProps;
}

/* -----------------------------------------------------------------------------------------------*/

export const AlertDialogCancel = ({
    closeOnClick = true,
    onClick,
    children,
    ...props
}: AlertDialogCancel.Props) => {
    const { close } = useAlertDialogContext();
    const handleClick = (event: Parameters<NonNullable<Button.Props['onClick']>>[0]) => {
        onClick?.(event);

        if (event.defaultPrevented) return;
        if (!closeOnClick) return;
        close();
    };

    return (
        <Button size="lg" colorPalette="secondary" onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};

interface AlertDialogCancelProps extends Omit<Button.Props, 'size' | 'colorPalette' | 'variant'> {
    /**
     * 클릭 시 다이얼로그를 자동으로 닫을지 여부.
     * @default true
     */
    closeOnClick?: boolean;
}

export namespace AlertDialogCancel {
    export type Props = AlertDialogCancelProps;
}
