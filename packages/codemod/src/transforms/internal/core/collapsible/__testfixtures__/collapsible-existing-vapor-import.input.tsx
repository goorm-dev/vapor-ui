import { Collapsible } from '@goorm-dev/vapor-core';
import { Button } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible>
        <Collapsible.Trigger>
            <Button>Toggle</Button>
        </Collapsible.Trigger>
        <Collapsible.Content>Content</Collapsible.Content>
    </Collapsible>
);
