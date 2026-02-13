import { MultiSelect } from '@vapor-ui/core';

const items = [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Angular', value: 'angular' },
];

export default function AnatomyMultiSelect() {
    return (
        <MultiSelect.Root data-part="Root" placeholder="Select frameworks" items={items}>
            <MultiSelect.TriggerPrimitive data-part="TriggerPrimitive">
                <MultiSelect.ValuePrimitive data-part="ValuePrimitive" />
                <MultiSelect.PlaceholderPrimitive data-part="PlaceholderPrimitive" />
                <MultiSelect.TriggerIconPrimitive data-part="TriggerIconPrimitive" />
            </MultiSelect.TriggerPrimitive>

            <MultiSelect.PortalPrimitive data-part="PortalPrimitive">
                <MultiSelect.PositionerPrimitive data-part="PositionerPrimitive">
                    <MultiSelect.PopupPrimitive data-part="PopupPrimitive">
                        <MultiSelect.Popup data-part="Popup">
                            <MultiSelect.Group data-part="Group">
                                <MultiSelect.GroupLabel data-part="GroupLabel">
                                    Frameworks
                                </MultiSelect.GroupLabel>
                                <MultiSelect.Separator data-part="Separator" />
                                {items.map((item) => (
                                    <MultiSelect.ItemPrimitive
                                        key={item.value}
                                        value={item.value}
                                        data-part="ItemPrimitive"
                                    >
                                        <MultiSelect.Item data-part="Item" value={item.value}>
                                            {item.label}
                                        </MultiSelect.Item>
                                    </MultiSelect.ItemPrimitive>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Popup>
                    </MultiSelect.PopupPrimitive>
                </MultiSelect.PositionerPrimitive>
            </MultiSelect.PortalPrimitive>
        </MultiSelect.Root>
    );
}
