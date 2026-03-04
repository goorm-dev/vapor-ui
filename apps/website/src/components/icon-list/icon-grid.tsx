import type { ReactNode } from 'react';

import { Box, Grid } from '@vapor-ui/core';

type IconGridProps = {
    children: ReactNode;
};

const IconGrid = ({ children }: IconGridProps) => {
    return (
        <Box
            $css={{
                maxHeight: '32rem',
                overflowY: 'auto',
                padding: '$100',
                borderRadius: '$400',
                backgroundColor: '$bg-secondary-100',
                border: '1px solid $border-normal',
            }}
        >
            <Grid.Root
                role="list"
                aria-label="아이콘 목록"
                templateColumns="repeat(auto-fill, minmax(8.5rem, 1fr))"
                $css={{
                    gap: '$150',
                    padding: '$200',
                }}
            >
                {children}
            </Grid.Root>
        </Box>
    );
};

export default IconGrid;
