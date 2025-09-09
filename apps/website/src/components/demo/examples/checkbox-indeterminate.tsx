import { useState } from 'react';

import { Checkbox, Text } from '@vapor-ui/core';

export default function CheckboxIndeterminate() {
    const [checkedItems, setCheckedItems] = useState({
        apple: false,
        banana: false,
        orange: false,
    });

    const allChecked = Object.values(checkedItems).every(Boolean);
    const isIndeterminate = Object.values(checkedItems).some(Boolean) && !allChecked;

    const handleSelectAll = (checked: boolean) => {
        setCheckedItems({
            apple: checked,
            banana: checked,
            orange: checked,
        });
    };

    const handleItemChange = (item: keyof typeof checkedItems, checked: boolean) => {
        setCheckedItems((prev) => ({
            ...prev,
            [item]: checked,
        }));
    };

    return (
        <div className="space-y-3">
            <Text typography="body2" className="flex items-center gap-2.5 font-medium">
                <Checkbox.Root
                    checked={allChecked}
                    indeterminate={isIndeterminate}
                    onCheckedChange={handleSelectAll}
                    className="flex items-center gap-3"
                />
                Select All Fruits
            </Text>
            <div className="ml-6 space-y-2">
                <Text typography="body2" className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox.Root
                        checked={checkedItems.apple}
                        onCheckedChange={(checked) => handleItemChange('apple', checked)}
                        className="flex items-center gap-3"
                    />
                    Apple
                </Text>

                <Text typography="body2" className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox.Root
                        checked={checkedItems.banana}
                        onCheckedChange={(checked) => handleItemChange('banana', checked)}
                        className="flex items-center gap-3"
                    />
                    Banana
                </Text>

                <Text typography="body2" className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox.Root
                        checked={checkedItems.orange}
                        onCheckedChange={(checked) => handleItemChange('orange', checked)}
                        className="flex items-center gap-3"
                    />
                    Orange
                </Text>
            </div>
        </div>
    );
}
