import { AlertDialog } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';

export default function Demo() {
    return (
        <AlertDialog.Root
            trigger={<Button>템플릿 삭제</Button>}
            type="critical"
            description={
                <>
                    삭제한 템플릿은 복구할 수 없습니다.
                    <br />
                    이미 생성된 모집·설문폼은 그대로유지됩니다.
                </>
            }
            title="템플릿을 삭제하시겠어요?"
            cancel={<AlertDialog.Cancel>취소</AlertDialog.Cancel>}
            action={<AlertDialog.Action>삭제하기</AlertDialog.Action>}
        />
    );
}
