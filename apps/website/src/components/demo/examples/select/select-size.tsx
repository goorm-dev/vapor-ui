import { Select } from '@vapor-ui/core';

export default function SelectSize() {
    return (
        <div className="flex flex-wrap gap-4">
            <Select.Root placeholder="Small" size="sm">
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

            <Select.Root placeholder="Medium" size="md">
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

            <Select.Root placeholder="Large" size="lg">
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

            <Select.Root placeholder="Extra Large" size="xl">
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
