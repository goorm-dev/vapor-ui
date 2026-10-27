import { Dialog } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';

export default function Demo() {
    return (
        <Dialog.Root
            ariaLabels={{ close: '닫기' }} // TODO: 닫기 버튼의 aria-label을 지정하세요.
            trigger={<Button>Open dialog</Button>}
            size="md"
            title="새 그룹 만들기"
            description="Description"

            action={<Dialog.Action>등록하기</Dialog.Action>}
        >
            {/* Missing snippet for 0:198 */}
        </Dialog.Root>
    );
}
