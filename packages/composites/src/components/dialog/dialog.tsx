'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Dialog as DialogPrimitives, IconButton, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

const slots = createSlots({
    title: <DialogPrimitives.Title />,
    trigger: <DialogPrimitives.Trigger />,
    description: <DialogPrimitives.Description />,
});

export const Dialog = ({
    // functional
    open,
    defaultOpen,
    onOpenChange,
    container,
    keepMounted,

    // variants
    size,

    // slots
    title,
    description,
    trigger,
    footer,
    children,
}: Dialog.Props) => {
    return (
        <DialogPrimitives.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            size={size}
        >
            <slots.trigger render={trigger} />

            <DialogPrimitives.PortalPrimitive container={container} keepMounted={keepMounted}>
                <DialogPrimitives.OverlayPrimitive />

                <DialogPrimitives.PopupPrimitive>
                    <DialogPrimitives.Header
                        $css={{
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            height: 'unset',
                            paddingTop: '$300',
                            paddingBottom: '$200',
                            gap: '$200',
                        }}
                    >
                        <VStack $css={{ alignItems: 'flex-start', gap: '$025', flex: 1 }}>
                            <slots.title render={title} />
                            <slots.description
                                render={description}
                                $css={{ color: '$basic-gray-500' }}
                            />
                        </VStack>

                        <CloseButton />
                    </DialogPrimitives.Header>

                    <Body>{children}</Body>

                    {footer && <Footer {...footer} />}
                </DialogPrimitives.PopupPrimitive>
            </DialogPrimitives.PortalPrimitive>
        </DialogPrimitives.Root>
    );
};

type Slots = SlotProps<typeof slots, 'title'>;
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
     * <Dialog onOpenChange={(open) => setOpen(open)} />
     */
    onOpenChange?: RootProps['onOpenChange'];

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
     * <Dialog trigger={<Button>열기</Button>} />
     */
    trigger?: Slots['trigger'];

    /**
     * 다이얼로그의 액션 요소들을 추가한다.
     * @example
     * <Dialog footer={{ actionButton: <Button>확인</Button> }} />
     */
    footer?: FooterProps;

    /**
     * 다이얼로그의 본문에 해당한다.
     */
    children?: ReactNode;
}

export namespace Dialog {
    export type Props = DialogProps;
}

/* -----------------------------------------------------------------------------------------------*/

type BodyProps = Pick<DialogPrimitives.Body.Props, 'children'>;

const Body = ({ children }: BodyProps) => {
    const bodyRef = useRef<HTMLDivElement>(null);
    const [overflowed, setOverflowed] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const element = bodyRef.current;
        if (!element) return;

        const update = () => {
            const scrollable = element.scrollHeight - element.clientHeight > 1;
            setOverflowed(element.scrollHeight - element.clientHeight > 1);

            const scrolled = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
            setScrolled(scrollable && scrolled);
        };

        update();
        element.addEventListener('scroll', update, { passive: true });

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(element);

        return () => {
            element.removeEventListener('scroll', update);
            resizeObserver.disconnect();
        };
    }, []);

    const scrollable = overflowed && !scrolled;

    return (
        <DialogPrimitives.Body
            ref={bodyRef}
            $css={{
                marginBottom: '$300',
                maskImage: scrollable ? 'linear-gradient(to top, transparent 0, black 20px)' : '',
            }}
        >
            {children}
        </DialogPrimitives.Body>
    );
};

/* -----------------------------------------------------------------------------------------------*/

const footerSlots = createSlots({
    assistiveButton: <DialogPrimitives.Close />,
    actionButton: <DialogPrimitives.Close />,
});

type FooterProps = SlotProps<typeof footerSlots>;

const Footer = ({ actionButton, assistiveButton }: FooterProps) => {
    return (
        <DialogPrimitives.Footer
            $css={{
                paddingTop: '$000',
                paddingBottom: '$300',
                justifyContent: 'space-between',
            }}
        >
            <footerSlots.assistiveButton render={assistiveButton} />
            <footerSlots.actionButton render={actionButton} />
        </DialogPrimitives.Footer>
    );
};

/* -----------------------------------------------------------------------------------------------*/

const CloseButton = () => {
    return (
        <DialogPrimitives.Close render={<IconButton colorPalette="secondary" variant="ghost" />}>
            <CloseOutlineIcon />
        </DialogPrimitives.Close>
    );
};
