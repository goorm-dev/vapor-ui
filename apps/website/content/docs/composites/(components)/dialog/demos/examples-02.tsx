import { Dialog } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';

export default function Demo() {
    return (
        <Dialog.Root
            ariaLabels={{ close: '닫기' }}
            trigger={<Button>문제 미리보기</Button>}
            size="md"
            title="문제 미리보기"
        >
            {/* Missing snippet for 0:254 */}
        </Dialog.Root>
    );
}
