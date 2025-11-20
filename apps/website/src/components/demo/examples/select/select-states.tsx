import { Select, VStack } from '@vapor-ui/core';

export default function SelectStates() {
    return (
        <VStack gap="$200" width="400px" className="flex-wrap">
            <SelectTemplate placeholder="기본 상태" />
            <SelectTemplate placeholder="비활성화" disabled />
            <SelectTemplate placeholder="읽기 전용" readOnly />
            <SelectTemplate placeholder="오류 상태" invalid />
        </VStack>
    );
}

const SelectTemplate = (props: Select.Root.Props) => {
    return (
        <Select.Root {...props}>
            <Select.Trigger />
            <Select.Popup>
                <Select.Item value="option1">옵션 1</Select.Item>
                <Select.Item value="option2">옵션 2</Select.Item>
            </Select.Popup>
        </Select.Root>
    );
};
