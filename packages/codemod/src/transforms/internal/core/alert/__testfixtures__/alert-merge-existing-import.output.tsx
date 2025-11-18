// @ts-nocheck
import { Button, Callout } from '@vapor-ui/core';
import { CheckIcon } from '@vapor-ui/icons';

export const Component = () => (
    <>
        <Callout.Root color="success">
            <Callout.Icon>
                <CheckIcon />
            </Callout.Icon>
            Success message
        </Callout.Root>
        <Button>Click</Button>
    </>
);
