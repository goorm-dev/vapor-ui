import { Badge } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Badge pill={false} color="primary">
            Primary
        </Badge>
        <Badge pill={true} color="hint">
            Hint
        </Badge>
    </>
);
