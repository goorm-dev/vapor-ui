import { Dialog } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';
import { CopyIcon } from '@vapor-ui/icons';

export default function Demo() {
    return (
        <Dialog.Root
            ariaLabels={{ close: '닫기' }}
            trigger={<Button>프로젝트 입장</Button>}
            size="md"
            title="프로젝트 입장 코드"
            description="회원가입 없이 입장 코드로 실습창에 입장할 수 있습니다. "
            assistive={
                <Button size="lg" colorPalette="secondary" variant="outline">
                    <CopyIcon />
                    코드 복사
                </Button>
            }
            action={<Dialog.Action>교사용 실습창 열기</Dialog.Action>}
        >
            {/* Missing snippet for 0:323 */}
        </Dialog.Root>
    );
}
