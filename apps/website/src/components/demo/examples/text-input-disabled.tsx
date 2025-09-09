import { TextInput } from '@vapor-ui/core';

export default function TextInputDisabled() {
    return (
        <div className="space-y-3">
            <label>
                비활성화
                <TextInput disabled placeholder="비활성화된 입력 필드" />
            </label>
            <label>
                값이 있는 비활성화
                <TextInput disabled defaultValue="기본 값이 있는 비활성화 필드" />
            </label>
        </div>
    );
}
