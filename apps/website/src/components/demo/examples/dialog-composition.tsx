import { Button, Dialog } from '@vapor-ui/core';

export default function DialogComposition() {
    return (
        <Dialog.Root size="lg" closeOnClickOverlay={false}>
            <Dialog.Trigger asChild>
                <Button variant="outline">확인 다이얼로그</Button>
            </Dialog.Trigger>
            <Dialog.CombinedContent>
                <Dialog.Header>
                    <Dialog.Title>작업 확인</Dialog.Title>
                    <Dialog.Close aria-label="Close" />
                </Dialog.Header>
                <Dialog.Body>
                    <Dialog.Description>
                        이 작업을 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer>
                    <Dialog.Close asChild>
                        <Button variant="ghost">취소</Button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                        <Button color="danger">삭제</Button>
                    </Dialog.Close>
                </Dialog.Footer>
            </Dialog.CombinedContent>
        </Dialog.Root>
    );
}
