import React from 'react';
import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => {
    const [open, setOpen] = React.useState(false);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Content>Content</Collapsible.Content>
        </Collapsible>
    );
};
