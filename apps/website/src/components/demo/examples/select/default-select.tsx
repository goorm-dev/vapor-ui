import { Select } from '@vapor-ui/core';

export default function DefaultSelect() {
    return (
        <Select.Root placeholder="폰트를 선택하세요">
            <Select.Trigger>
                <Select.Value />
                <Select.TriggerIcon />
            </Select.Trigger>

            <Select.Content>
                <Select.Group>
                    <Select.GroupLabel>폰트</Select.GroupLabel>
                    <Select.Item value="sans">
                        Sans-serif
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="serif">
                        Serif
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="mono">
                        Monospace
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="cursive">
                        Cursive
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Group>
            </Select.Content>
        </Select.Root>
    );
}
