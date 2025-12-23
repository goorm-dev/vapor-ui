// @ts-nocheck
import { Checkbox } from '@goorm-dev/vapor-core';

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
        <Checkbox
            checked={checkboxCheckedState}
            disabled={isRowNotSelectable}
            onCheckedChange={handleCheckboxChange}
        >
            <Checkbox.Indicator />
        </Checkbox>
    );
};
