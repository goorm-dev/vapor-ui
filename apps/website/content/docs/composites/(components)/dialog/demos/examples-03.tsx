import { Dialog } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';

export default function Demo() {
    return (
        <Dialog.Root
            ariaLabels={{ close: '닫기' }} // TODO: 닫기 버튼의 aria-label을 지정하세요.
            trigger={<Button>Open dialog</Button>}
            size="md"
            title="프로젝트 입장 코드"
            description="회원가입 없이 입장 코드로 실습창에 입장할 수 있습니다. "
            assistive={
                <Dialog.Assistive>
                    {/* Code Connect Logic Instance */}
                    코드 복사
                </Dialog.Assistive>
            }
            action={<Dialog.Action>교사용 실습창 열기</Dialog.Action>}
        >
            {/* Missing snippet for 0:323 */}
        </Dialog.Root>
    );
}
