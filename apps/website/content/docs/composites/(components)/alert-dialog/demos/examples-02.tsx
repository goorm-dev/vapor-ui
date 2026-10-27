import { AlertDialog } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';

export default function Demo() {
    return (
        <AlertDialog.Root
            trigger={<Button>수강신청 승인</Button>}
            type="confirm"
            description={
                <>
                    승인하면 수강생에게 안내 메일이 발송되며,
                    <br />
                    수강생은 바로 강의를 수강할 수 있습니다.
                </>
            }
            title="수강 신청 12건을 승인하시겠어요?"
            cancel={<AlertDialog.Cancel>취소</AlertDialog.Cancel>}
            action={<AlertDialog.Action>승인하기</AlertDialog.Action>}
        />
    );
}
