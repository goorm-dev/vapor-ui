import { Button, Dialog } from '@vapor-ui/core';

export default function DialogModal() {
    return (
        <div className="space-x-4">
            <Dialog.Root modal={true}>
                <Dialog.Trigger render={<Button>Modal Dialog</Button>} />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Modal Dialog</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>
                            포커스가 다이얼로그 내부에 제한됩니다.
                        </Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close render={<Button>확인</Button>} />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root modal={false}>
                <Dialog.Trigger render={<Button>Non-Modal Dialog</Button>} />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Non-Modal Dialog</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>
                            배경의 다른 요소들과 상호작용할 수 있습니다.
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
