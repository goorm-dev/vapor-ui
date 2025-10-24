import { IconButton } from '@vapor-ui/core';

export const Component = () => (
    <IconButton
        render={
            <button type="submit">
                <svg>Icon</svg>
            </button>
        }
        size="lg"
        color="primary"
        shape="circle"
    />
);
