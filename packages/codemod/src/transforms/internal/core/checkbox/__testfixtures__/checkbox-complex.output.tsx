import { Checkbox } from '@vapor-ui/core';

export const Component = ({ table }: any) => {
    const isRowNotSelectable = table.getRowModel().rows.length === 0;
    const checkboxCheckedState = table.getIsSomePageRowsSelected()
        ? 'indeterminate'
        : table.getIsAllRowsSelected();

    const handleCheckboxChange = (checked: any) => {
        const updatedCheckedState = checked === 'indeterminate' ? true : checked;
        table.toggleAllPageRowsSelected(updatedCheckedState);
    };

    return (
        // TODO: onCheckedChange signature changed - now receives (checked: boolean, event: Event) instead of (checked: CheckedState)
        // TODO: If checked can be 'indeterminate', split the logic: use indeterminate prop for indeterminate state and checked prop for boolean
        <Checkbox.Root
            checked={checkboxCheckedState}
            disabled={isRowNotSelectable}
            onCheckedChange={handleCheckboxChange}
        >
            <Checkbox.Indicator />
        </Checkbox.Root>
    );
};
