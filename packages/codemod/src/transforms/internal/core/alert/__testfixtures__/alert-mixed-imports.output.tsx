// @ts-nocheck
import { Badge, Button } from '@goorm-dev/vapor-core';
import { Callout } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Callout.Root color="primary">Alert message</Callout.Root>
        <Badge color="primary">Badge</Badge>
        <Button>Button</Button>
    </>
);
