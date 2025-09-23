import { Button, Dialog } from '@vapor-ui/core';

export default function DefaultDialog() {
    return (
        <Dialog.Root>
            <Dialog.Trigger render={<Button />}>클릭</Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>알림</Dialog.Title>
                    <Dialog.Close aria-label="Close" />
                </Dialog.Header>
                <Dialog.Body>
                    <Dialog.Description>
                        여기에 다이얼로그 본문 내용이 들어갑니다.
                    </Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer style={{ marginLeft: 'auto' }}>
                    <Button color="primary">확인</Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
    );
}
