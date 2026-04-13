import { Button, Dialog } from '@vapor-ui/core';

export default function DialogCustomOverlay() {
    return (
        <Dialog.Root>
            <Dialog.Trigger render={<Button variant="outline">열기</Button>} />
            <Dialog.Popup
                overlayElement={
                    <Dialog.OverlayPrimitive style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} />
                }
            >
                <Dialog.Header>
                    <Dialog.Title>커스텀 오버레이</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    <Dialog.Description>
                        overlayElement prop으로 오버레이의 스타일을 교체한 예시입니다.
                    </Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer>
                    <Dialog.Close render={<Button colorPalette="contrast">닫기</Button>} />
                </Dialog.Footer>
            </Dialog.Popup>
        </Dialog.Root>
    );
}
