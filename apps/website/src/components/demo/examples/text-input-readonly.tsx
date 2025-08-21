import { TextInput } from '@vapor-ui/core';

export default function TextInputReadOnly() {
    return (
        <div className="space-y-3">
            <TextInput.Root readOnly defaultValue="수정할 수 없는 값">
                <TextInput.Label>읽기 전용</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root readOnly defaultValue="user@example.com">
                <TextInput.Label>사용자 이메일</TextInput.Label>
                <TextInput.Field type="email" />
            </TextInput.Root>
        </div>
    );
}