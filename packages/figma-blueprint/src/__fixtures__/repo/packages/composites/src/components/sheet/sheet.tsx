import { Button, Divider, IconButton, Panel as PanelPrimitives, VStack } from '@vapor-ui/core';

import { createSlots } from '~/utils/create-slots';

const slots = createSlots({ title: PanelPrimitives.Title, action: Button });

export const SheetRoot = ({ title, action }) => (
    <PanelPrimitives.Root>
        <Header title={title} />
        <Divider />
        <slots.action render={action} />
    </PanelPrimitives.Root>
);

export const SheetFlagged = ({ closable }) => (
    <PanelPrimitives.Root>{closable && <CloseButton />}</PanelPrimitives.Root>
);

export const SheetChoice = ({ closable }) => (
    <PanelPrimitives.Root>{closable ? <CloseButton /> : null}</PanelPrimitives.Root>
);

export const SheetGuarded = ({ closable }) => {
    if (!closable) return null;
    return <CloseButton />;
};

const Header = ({ title }) => {
    return (
        <PanelPrimitives.Header>
            <VStack>
                <slots.title render={title} />
            </VStack>
            <CloseButton />
        </PanelPrimitives.Header>
    );
};

const CloseButton = () => <PanelPrimitives.Close render={<IconButton />} />;
