import type { MultiSelectRootProps } from '@vapor-ui/core';
import { MultiSelect, VStack } from '@vapor-ui/core';

const options = [
    { label: '옵션 1', value: 'option1' },
    { label: '옵션 2', value: 'option2' },
    { label: '옵션 3', value: 'option3' },
];

export default function MultiSelectStates() {
    return (
        <VStack gap="$200" width="400px">
            <MultiSelectTemplate placeholder="기본 상태" />
            <MultiSelectTemplate placeholder="비활성화" disabled />
            <MultiSelectTemplate placeholder="읽기 전용" readOnly />
            <MultiSelectTemplate placeholder="오류 상태" invalid />
        </VStack>
    );
}

export const MultiSelectTemplate = (props: MultiSelectRootProps<string>) => {
    return (
        <MultiSelect.Root {...props}>
            <MultiSelect.Trigger>
                <MultiSelect.Value />
                <MultiSelect.TriggerIcon />
            </MultiSelect.Trigger>
            <MultiSelect.Content>
                {options.map((option) => (
                    <MultiSelect.Item key={option.value} value={option.value}>
                        {option.label}
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                ))}
            </MultiSelect.Content>
        </MultiSelect.Root>
    );
};
