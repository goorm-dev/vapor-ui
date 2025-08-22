import { TextInput } from '@vapor-ui/core';

export default function TextInputVisuallyHidden() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 라벨</h4>
                <TextInput.Root placeholder="이름을 입력하세요">
                    <TextInput.Label>보이는 라벨</TextInput.Label>
                    <TextInput.Field />
                </TextInput.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">시각적으로 숨겨진 라벨</h4>
                <TextInput.Root
                    visuallyHidden
                    placeholder="이름을 입력하세요"
                    aria-label="사용자 이름"
                >
                    <TextInput.Field />
                </TextInput.Root>
            </div>
        </div>
    );
}
