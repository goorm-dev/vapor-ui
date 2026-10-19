import { Dialog } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';

export default function FormExample() {
    return (
        <Dialog.Root
            ariaLabels={{ close: '시험 설정 닫기' }}
            size="md"
            title="시험 설정 모드"
            description="아래 중 원하는 설정 모드를 선택한 후 시작해 주세요."
            action={<Button>시작하기</Button>}
        >
            (content)
        </Dialog.Root>
    );
}
