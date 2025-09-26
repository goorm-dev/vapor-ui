import { Button, Dialog } from '@vapor-ui/core';

export default function DialogVariants() {
    return (
        <div className="flex gap-4">
            <Dialog.Root size="md" closeOnClickOverlay={false}>
                <Dialog.Trigger render={<Button>Medium + Prevent Overlay Click</Button>} />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Medium Size</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>Overlay 클릭 시 닫을 수 없습니다.</Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close render={<Button>확인</Button>} />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root size="xl" modal={false}>
                <Dialog.Trigger render={<Button>XL + Non-Modal</Button>} />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Extra Large Size</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>
                            매우 큰 크기의 non-modal 다이얼로그입니다. 배경과 상호작용이 가능합니다.
                        </Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close render={<Button>확인</Button>} />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    );
}
