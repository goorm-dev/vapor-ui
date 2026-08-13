'use client';

import { Dialog as DialogPrimitives, HStack, IconButton, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

const slots = createSlots({
    title: <DialogPrimitives.Title />,
    trigger: <DialogPrimitives.Trigger />,
    description: <DialogPrimitives.Description />,
});

type Slots = SlotProps<typeof slots, 'title'>;
type RootProps = Pick<DialogPrimitives.Root.Props, 'open' | 'onOpenChange' | 'defaultOpen'>;
type PortalProps = Pick<DialogPrimitives.PortalPrimitive.Props, 'container' | 'keepMounted'>;
type PopupProps = Pick<DialogPrimitives.Popup.Props, 'children'>;

export interface DialogProps extends Slots, RootProps, PortalProps, PopupProps {
    closeButton?: boolean;
    actionButtons?: ActionButtonProps;
}

export const Dialog = ({
    // functional
    open,
    defaultOpen,
    onOpenChange,
    container,
    keepMounted,

    // slots
    title,
    description,
    trigger,
    closeButton,
    actionButtons,
    children,
}: DialogProps) => {
    return (
        <DialogPrimitives.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <slots.trigger render={trigger} />

            <DialogPrimitives.PortalPrimitive container={container} keepMounted={keepMounted}>
                <DialogPrimitives.OverlayPrimitive />

                <DialogPrimitives.PopupPrimitive>
                    <DialogPrimitives.Header
                        $css={{
                            justifyContent: 'space-between',
                            height: 'unset',
                            paddingBlock: '$300',
                        }}
                    >
                        <VStack $css={{ alignItems: 'flex-start' }}>
                            <slots.title render={title} />
                            <slots.description render={description} />
                        </VStack>

                        {closeButton && <CloseButton />}
                    </DialogPrimitives.Header>

                    <DialogPrimitives.Body $css={{ paddingBottom: '$300' }}>
                        {children}
                    </DialogPrimitives.Body>

                    {actionButtons && <ActionButtons {...actionButtons} />}
                </DialogPrimitives.PopupPrimitive>
            </DialogPrimitives.PortalPrimitive>
        </DialogPrimitives.Root>
    );
};

/* -----------------------------------------------------------------------------------------------*/

const actionButtonsSlots = createSlots({
    assistive: <DialogPrimitives.Close />,
    leading: <DialogPrimitives.Close />,
    trailing: <DialogPrimitives.Close />,
});

type ActionButtonProps = SlotProps<typeof actionButtonsSlots, 'trailing'>;

const ActionButtons = ({ assistive, leading, trailing }: ActionButtonProps) => {
    return (
        <DialogPrimitives.Footer $css={{ paddingTop: '$000', paddingBottom: '$300' }}>
            <actionButtonsSlots.assistive render={assistive} />

            <HStack $css={{ flex: 1, justifyContent: 'flex-end', gap: '$100' }}>
                <actionButtonsSlots.leading render={leading} />
                <actionButtonsSlots.trailing render={trailing} />
            </HStack>
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
