import React from 'react';

import { Collapsible } from '@vapor-ui/core';

export const Component = () => {
    const [open, setOpen] = React.useState(false);

    return (
        <Collapsible.Root open={open} onOpenChange={setOpen}>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Panel>Content</Collapsible.Panel>
        </Collapsible.Root>
    );
};
