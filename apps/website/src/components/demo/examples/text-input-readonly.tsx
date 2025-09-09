import { TextInput } from '@vapor-ui/core';

export default function TextInputReadOnly() {
    return (
        <div className="space-y-3">
            <label>
                읽기 전용
                <TextInput readOnly defaultValue="수정할 수 없는 값" />
            </label>
            <label>
                사용자 이메일
                <TextInput type="email" readOnly defaultValue="user@example.com" />
            </label>
        </div>
    );
}
