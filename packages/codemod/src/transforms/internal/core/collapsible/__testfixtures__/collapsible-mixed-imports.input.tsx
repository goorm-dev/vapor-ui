import { Button } from '@goorm-dev/vapor-components';
import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Collapsible>
        <Collapsible.Trigger>
            <Button>Toggle</Button>
        </Collapsible.Trigger>
        <Collapsible.Content>Content</Collapsible.Content>
    </Collapsible>
);
