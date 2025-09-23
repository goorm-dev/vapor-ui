import { Button, Dialog } from '@vapor-ui/core';

export default function DialogSize() {
    return (
        <div className="space-x-4">
            <Dialog.Root size="md">
                <Dialog.Trigger render={<Button>Medium Dialog</Button>} />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Medium Size</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>Medium 크기의 다이얼로그입니다.</Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close render={<Button variant="ghost">취소</Button>} />
                        <Button>확인</Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root size="lg">
                <Dialog.Trigger render={<Button>Large Dialog</Button>} />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Large Size</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>Large 크기의 다이얼로그입니다.</Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close render={<Button variant="ghost">취소</Button>} />
                        <Button>확인</Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root size="xl">
                <Dialog.Trigger render={<Button>Extra Large Dialog</Button>} />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Extra Large Size</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>
                            Extra Large 크기의 다이얼로그입니다.
                        </Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close render={<Button variant="ghost">취소</Button>} />
                        <Button>확인</Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    );
}
