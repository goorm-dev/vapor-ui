import { TextInput } from '@vapor-ui/core';

export default function TextInputDisabled() {
    return (
        <div className="space-y-3">
            <TextInput.Root disabled placeholder="비활성화된 입력 필드">
                <TextInput.Label>비활성화</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root disabled defaultValue="기본 값이 있는 비활성화 필드">
                <TextInput.Label>값이 있는 비활성화</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
        </div>
    );
}