import { Select } from '@vapor-ui/core';

export default function SelectStates() {
    return (
        <div className="flex flex-wrap gap-4">
            <Select.Root placeholder="기본 상태">
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="option1">
                        옵션 1
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="option2">
                        옵션 2
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Content>
            </Select.Root>

            <Select.Root placeholder="비활성화" disabled>
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="option1">
                        옵션 1
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="option2">
                        옵션 2
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Content>
            </Select.Root>

            <Select.Root placeholder="읽기 전용" readOnly>
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="option1">
                        옵션 1
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="option2">
                        옵션 2
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Content>
            </Select.Root>

            <Select.Root placeholder="오류 상태" invalid>
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="option1">
                        옵션 1
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="option2">
                        옵션 2
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Content>
            </Select.Root>
        </div>
    );
}
