import { Select } from '@vapor-ui/core';

const items = [
    { label: 'Sans-serif', value: 'sans-serif' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
];

export default function AnatomySelect() {
    return (
        <Select.Root data-part="Root" placeholder="Select a font" items={items}>
            <Select.Trigger data-part="Trigger" width="400px" />
            <Select.PortalPrimitive data-part="PortalPrimitive">
                <Select.PositionerPrimitive data-part="PositionerPrimitive">
                    <Select.PopupPrimitive data-part="PopupPrimitive">
                        <Select.Popup data-part="Popup">
                            <Select.Group data-part="Group">
                                <Select.GroupLabel data-part="GroupLabel">Fonts</Select.GroupLabel>
                                <Select.Separator data-part="Separator" />
                                {items.map((item) => (
                                    <Select.ItemPrimitive
                                        key={item.value}
                                        value={item.value}
                                        data-part="ItemPrimitive"
                                    >
                                        <Select.Item data-part="Item" value={item.value}>
                                            {item.label}
                                            <Select.ItemIndicatorPrimitive data-part="ItemIndicatorPrimitive" />
                                        </Select.Item>
                                    </Select.ItemPrimitive>
                                ))}
                            </Select.Group>
                        </Select.Popup>
                    </Select.PopupPrimitive>
                </Select.PositionerPrimitive>
            </Select.PortalPrimitive>
        </Select.Root>
    );
}
