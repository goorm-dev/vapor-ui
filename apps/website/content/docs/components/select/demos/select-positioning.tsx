import { HStack, Select } from '@vapor-ui/core';

export default function SelectPositioning() {
    return (
        <HStack $css={{ maxWidth: '800px', width: '100%', gap: '$250' }}>
            <Select.Root placeholder="Top">
                <Select.Trigger />
                <Select.PortalPrimitive>
                    <Select.PositionerPrimitive side="top">
                        <Select.PopupPrimitive>
                            <Select.Item value="option1">옵션 1</Select.Item>
                            <Select.Item value="option2">옵션 2</Select.Item>
                        </Select.PopupPrimitive>
                    </Select.PositionerPrimitive>
                </Select.PortalPrimitive>
            </Select.Root>

            <Select.Root placeholder="Right">
                <Select.Trigger />
                <Select.PortalPrimitive>
                    <Select.PositionerPrimitive side="right">
                        <Select.PopupPrimitive>
                            <Select.Item value="option1">옵션 1</Select.Item>
                            <Select.Item value="option2">옵션 2</Select.Item>
                        </Select.PopupPrimitive>
                    </Select.PositionerPrimitive>
                </Select.PortalPrimitive>
            </Select.Root>

            <Select.Root placeholder="Bottom">
                <Select.Trigger />
                <Select.PortalPrimitive>
                    <Select.PositionerPrimitive side="bottom">
                        <Select.PopupPrimitive>
                            <Select.Item value="option1">옵션 1</Select.Item>
                            <Select.Item value="option2">옵션 2</Select.Item>
                        </Select.PopupPrimitive>
                    </Select.PositionerPrimitive>
                </Select.PortalPrimitive>
            </Select.Root>

            <Select.Root placeholder="Left">
                <Select.Trigger />
                <Select.PortalPrimitive>
                    <Select.PositionerPrimitive side="left">
                        <Select.PopupPrimitive>
                            <Select.Item value="option1">옵션 1</Select.Item>
                            <Select.Item value="option2">옵션 2</Select.Item>
                        </Select.PopupPrimitive>
                    </Select.PositionerPrimitive>
                </Select.PortalPrimitive>
            </Select.Root>
        </HStack>
    );
}
