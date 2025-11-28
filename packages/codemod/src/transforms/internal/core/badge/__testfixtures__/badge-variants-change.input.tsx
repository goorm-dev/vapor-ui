// @ts-nocheck
import { Badge } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Badge pill={false}>Default</Badge>
        <Badge>Default</Badge>
        <Badge pill={true}>Pill</Badge>
        <Badge pill>Pill</Badge>
    </>
);
