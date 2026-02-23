import { HStack, Select } from '@vapor-ui/core';

export default function SelectPositioning() {
    return (
        <HStack $css={{ maxWidth: '800px', width: '100%', gap: '$250' }}>
            <Select.Root placeholder="Top">
                <Select.Trigger />
                <Select.Popup positionerElement={<Select.PositionerPrimitive side="top" />}>
                    <Select.Item value="option1">옵션 1</Select.Item>
                    <Select.Item value="option2">옵션 2</Select.Item>
                </Select.Popup>
            </Select.Root>

            <Select.Root placeholder="Right">
                <Select.Trigger />
                <Select.Popup positionerElement={<Select.PositionerPrimitive side="right" />}>
                    <Select.Item value="option1">옵션 1</Select.Item>
                    <Select.Item value="option2">옵션 2</Select.Item>
                </Select.Popup>
            </Select.Root>

            <Select.Root placeholder="Bottom">
                <Select.Trigger />
                <Select.Popup positionerElement={<Select.PositionerPrimitive side="bottom" />}>
                    <Select.Item value="option1">옵션 1</Select.Item>
                    <Select.Item value="option2">옵션 2</Select.Item>
                </Select.Popup>
            </Select.Root>

            <Select.Root placeholder="Left">
                <Select.Trigger />
                <Select.Popup positionerElement={<Select.PositionerPrimitive side="left" />}>
                    <Select.Item value="option1">옵션 1</Select.Item>
                    <Select.Item value="option2">옵션 2</Select.Item>
                </Select.Popup>
            </Select.Root>
        </HStack>
    );
}
