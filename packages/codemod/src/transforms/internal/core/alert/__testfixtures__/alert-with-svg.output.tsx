// @ts-nocheck
import { Callout } from '@vapor-ui/core';

export const Component = () => (
    <Callout.Root color="warning">
        <Callout.Icon>
            <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M10 0L20 20H0L10 0Z" />
            </svg>
        </Callout.Icon>
        Warning message
    </Callout.Root>
);
