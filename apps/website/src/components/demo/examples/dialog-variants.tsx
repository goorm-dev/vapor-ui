import { Dialog, Button } from '@vapor-ui/core';

export default function DialogVariants() {
    return (
        <div className="space-y-4">
            <div className="space-x-4">
                <Dialog.Root size="md" closeOnEscape={false}>
                    <Dialog.Trigger asChild>
                        <Button>Medium + No ESC</Button>
                    </Dialog.Trigger>
                    <Dialog.CombinedContent>
                        <Dialog.Header>
                            <Dialog.Title>Medium Size</Dialog.Title>
                            <Dialog.Close aria-label="Close" />
                        </Dialog.Header>
                        <Dialog.Body>
                            <Dialog.Description>ESC 키로 닫을 수 없습니다.</Dialog.Description>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.Close asChild>
                                <Button>확인</Button>
                            </Dialog.Close>
                        </Dialog.Footer>
                    </Dialog.CombinedContent>
                </Dialog.Root>
                
                <Dialog.Root size="xl" modal={false}>
                    <Dialog.Trigger asChild>
                        <Button>XL + Non-Modal</Button>
                    </Dialog.Trigger>
                    <Dialog.CombinedContent>
                        <Dialog.Header>
                            <Dialog.Title>Extra Large Size</Dialog.Title>
                            <Dialog.Close aria-label="Close" />
                        </Dialog.Header>
                        <Dialog.Body>
                            <Dialog.Description>
                                매우 큰 크기의 non-modal 다이얼로그입니다.
                                배경과 상호작용이 가능합니다.
                            </Dialog.Description>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.Close asChild>
                                <Button>확인</Button>
                            </Dialog.Close>
                        </Dialog.Footer>
                    </Dialog.CombinedContent>
                </Dialog.Root>
            </div>
        </div>
    );
}