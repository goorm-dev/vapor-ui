import { Checkbox } from '@vapor-ui/core';

export default function AnatomyCheckbox() {
    return (
        <Checkbox.Root data-part="Root" defaultChecked>
            <Checkbox.IndicatorPrimitive data-part="IndicatorPrimitive" />
        </Checkbox.Root>
    );
}
