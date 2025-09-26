import { HStack, Select } from '@vapor-ui/core';

export default function SelectPositioning() {
    return (
        <HStack maxWidth="800px" width="100%" gap="$250">
            <Select.Root placeholder="Top">
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>
                <Select.Content positionerProps={{ side: 'top' }}>
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

            <Select.Root placeholder="Right">
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>
                <Select.Content positionerProps={{ side: 'right' }}>
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

            <Select.Root placeholder="Bottom">
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>
                <Select.Content positionerProps={{ side: 'bottom' }}>
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

            <Select.Root placeholder="Left">
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>
                <Select.Content positionerProps={{ side: 'left' }}>
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
        </HStack>
    );
}
