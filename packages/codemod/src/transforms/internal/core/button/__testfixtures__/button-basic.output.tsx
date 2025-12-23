import { Button } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Button variant="fill" colorPalette="primary">
            Primary
        </Button>
        <Button variant="outline" colorPalette="primary">
            Secondary
        </Button>
        <Button variant="ghost" colorPalette="primary">
            Tertiary
        </Button>
    </>
);
