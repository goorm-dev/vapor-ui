import { Alert } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Alert color="warning">
        <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M10 0L20 20H0L10 0Z" />
        </svg>
        Warning message
    </Alert>
);
