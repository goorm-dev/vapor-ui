import { Flex, Select } from '@vapor-ui/core';

export default function SelectSize() {
    return (
        <Flex maxWidth="800px" width="100%" gap="$250">
            <SelectTemplate placeholder="Small" size="sm" />
            <SelectTemplate placeholder="Medium" size="md" />
            <SelectTemplate placeholder="Large" size="lg" />
            <SelectTemplate placeholder="Extra Large" size="xl" />
        </Flex>
    );
}

const SelectTemplate = (props: Select.Root.Props) => {
    return (
        <Select.Root {...props}>
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
    );
};
