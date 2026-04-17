import { Button, HStack, Spinner } from '@vapor-ui/core';

export default function SpinnerColor() {
    return (
        <HStack $css={{ gap: '1rem' }}>
            <Button colorPalette="primary" variant="fill">
                <Spinner colorPalette="inverse" />
                로딩 중...
            </Button>

            <Button colorPalette="secondary" variant="outline">
                <Spinner colorPalette="inverse" />
                로딩 중...
            </Button>

            <Button colorPalette="success" variant="ghost">
                <Spinner colorPalette="inverse" />
                로딩 중...
            </Button>
        </HStack>
    );
}
