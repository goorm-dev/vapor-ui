import { TextInput } from '@vapor-ui/core';

export default function TextInputInvalid() {
    return (
        <div className="space-y-3">
            <label>
                이메일
                <TextInput
                    type="email"
                    invalid
                    placeholder="잘못된 이메일 형식"
                    defaultValue="invalid-email"
                />
            </label>
            <label>
                필수 필드
                <TextInput invalid placeholder="필수 입력 항목" />
            </label>
        </div>
    );
}
