'use client';

import { Button, Collapsible, Text } from '@vapor-ui/core';

export default function AnatomyCollapsible() {
    return (
        <Collapsible.Root data-part="Root" defaultOpen>
            <Collapsible.Trigger data-part="Trigger" render={<Button variant="outline" />}>
                Toggle Details
            </Collapsible.Trigger>
            <Collapsible.Panel data-part="Panel">
                <Text typography="body2" foreground="normal-100">
                    This is the collapsible panel content that can be toggled open and closed.
                </Text>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
}
