import { Flex, MultiSelect } from '@vapor-ui/core';

const options = [
    { label: '옵션 1', value: 'option1' },
    { label: '옵션 2', value: 'option2' },
    { label: '옵션 3', value: 'option3' },
];

export default function MultiSelectSize() {
    return (
        <Flex gap="$200" className="flex-wrap" width="400px">
            <MultiSelect.Root placeholder="Small" size="sm" items={options}>
                <MultiSelect.Trigger />
                <MultiSelect.Popup>
                    {options.map((option) => (
                        <MultiSelect.Item key={option.value} value={option.value}>
                            {option.label}
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Popup>
            </MultiSelect.Root>

            <MultiSelect.Root placeholder="Medium" size="md" items={options}>
                <MultiSelect.Trigger />
                <MultiSelect.Popup>
                    {options.map((option) => (
                        <MultiSelect.Item key={option.value} value={option.value}>
                            {option.label}
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Popup>
            </MultiSelect.Root>

            <MultiSelect.Root placeholder="Large" size="lg" items={options}>
                <MultiSelect.Trigger />
                <MultiSelect.Popup>
                    {options.map((option) => (
                        <MultiSelect.Item key={option.value} value={option.value}>
                            {option.label}
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Popup>
            </MultiSelect.Root>

            <MultiSelect.Root placeholder="Extra Large" size="xl" items={options}>
                <MultiSelect.Trigger />
                <MultiSelect.Popup>
                    {options.map((option) => (
                        <MultiSelect.Item key={option.value} value={option.value}>
                            {option.label}
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Popup>
            </MultiSelect.Root>
        </Flex>
    );
}
