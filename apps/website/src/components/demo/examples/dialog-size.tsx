import { Dialog, Button } from '@vapor-ui/core';

export default function DialogSize() {
    return (
        <div className="space-x-4">
            <Dialog.Root size="md">
                <Dialog.Trigger asChild>
                    <Button>Medium Dialog</Button>
                </Dialog.Trigger>
                <Dialog.CombinedContent>
                    <Dialog.Header>
                        <Dialog.Title>Medium Size</Dialog.Title>
                        <Dialog.Close aria-label="Close" />
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>Medium 크기의 다이얼로그입니다.</Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close asChild>
                            <Button variant="ghost">취소</Button>
                        </Dialog.Close>
                        <Button>확인</Button>
                    </Dialog.Footer>
                </Dialog.CombinedContent>
            </Dialog.Root>
            
            <Dialog.Root size="lg">
                <Dialog.Trigger asChild>
                    <Button>Large Dialog</Button>
                </Dialog.Trigger>
                <Dialog.CombinedContent>
                    <Dialog.Header>
                        <Dialog.Title>Large Size</Dialog.Title>
                        <Dialog.Close aria-label="Close" />
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>Large 크기의 다이얼로그입니다.</Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close asChild>
                            <Button variant="ghost">취소</Button>
                        </Dialog.Close>
                        <Button>확인</Button>
                    </Dialog.Footer>
                </Dialog.CombinedContent>
            </Dialog.Root>
            
            <Dialog.Root size="xl">
                <Dialog.Trigger asChild>
                    <Button>Extra Large Dialog</Button>
                </Dialog.Trigger>
                <Dialog.CombinedContent>
                    <Dialog.Header>
                        <Dialog.Title>Extra Large Size</Dialog.Title>
                        <Dialog.Close aria-label="Close" />
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>Extra Large 크기의 다이얼로그입니다.</Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close asChild>
                            <Button variant="ghost">취소</Button>
                        </Dialog.Close>
                        <Button>확인</Button>
                    </Dialog.Footer>
                </Dialog.CombinedContent>
            </Dialog.Root>
        </div>
    );
}