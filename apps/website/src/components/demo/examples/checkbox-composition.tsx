import { Checkbox } from '@vapor-ui/core';

export default function CheckboxComposition() {
    return (
        <div className="space-y-4">
            {/* Basic composition */}
            <Checkbox.Root>
                <Checkbox.Control />
                <Checkbox.Label>기본 구성</Checkbox.Label>
            </Checkbox.Root>

            {/* Label first composition */}
            <Checkbox.Root>
                <Checkbox.Label>레이블이 먼저 오는 구성</Checkbox.Label>
                <Checkbox.Control />
            </Checkbox.Root>

            {/* Control only (no label) */}
            <Checkbox.Root>
                <Checkbox.Control aria-label="선택하기" />
            </Checkbox.Root>

            {/* Custom layout with additional elements */}
            <Checkbox.Root className="flex items-start gap-3">
                <Checkbox.Control className="mt-1" />
                <div className="flex flex-col gap-1">
                    <Checkbox.Label className="font-medium">이용약관 동의</Checkbox.Label>
                    <span className="text-sm text-gray-500">
                        서비스 이용약관 및 개인정보 처리방침에 동의합니다.
                    </span>
                </div>
            </Checkbox.Root>
        </div>
    );
}
