import { Button, HStack, Spinner } from '@vapor-ui/core';

export default function SpinnerColor() {
    return (
        <HStack $css={{ gap: '1rem' }}>
            <Button colorPalette="primary" variant="fill">
                <Spinner colorPalette="inherit" />
                로딩 중...
            </Button>

            <Button colorPalette="secondary" variant="outline">
                <Spinner colorPalette="inherit" />
                로딩 중...
            </Button>

            <Button colorPalette="success" variant="ghost">
                <Spinner colorPalette="inherit" />
                로딩 중...
            </Button>
        </HStack>
    );
}
