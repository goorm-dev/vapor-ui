import { TextInput } from '@vapor-ui/core';

export default function TextInputInvalid() {
    return (
        <div className="space-y-3">
            <TextInput.Root invalid placeholder="잘못된 이메일 형식">
                <TextInput.Label>이메일</TextInput.Label>
                <TextInput.Field type="email" defaultValue="invalid-email" />
            </TextInput.Root>
            <TextInput.Root invalid placeholder="필수 입력 항목">
                <TextInput.Label>필수 필드</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
        </div>
    );
}