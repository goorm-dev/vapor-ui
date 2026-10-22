import { Dialog } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';

export default function Demo() {
    return (
        <Dialog.Root
            ariaLabels={{ close: '닫기' }}
            trigger={<Button>새 그룹 만들기</Button>}
            size="md"
            title="새 그룹 만들기"
            action={
                <Button size="lg" colorPalette="primary" variant="fill">
                    등록하기
                </Button>
            }
        >
            (content)
        </Dialog.Root>
    );
}
