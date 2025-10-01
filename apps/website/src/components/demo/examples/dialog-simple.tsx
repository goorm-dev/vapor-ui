import { Button, Dialog } from '@vapor-ui/core';

export default function DialogSimple() {
    return (
        <Dialog.Root>
            <Dialog.Trigger render={<Button>단순 다이얼로그 열기</Button>} />
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>알림</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    <Dialog.Description>
                        이것은 기본적인 다이얼로그입니다. Escape 키나 배경 클릭으로 닫을 수
                        있습니다.
                    </Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer>
                    <Dialog.Close render={<Button>확인</Button>} />
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
    );
}
