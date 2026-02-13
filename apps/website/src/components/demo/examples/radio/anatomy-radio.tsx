import { Radio } from '@vapor-ui/core';

export default function AnatomyRadio() {
    return (
        <Radio.Root data-part="Root" value="option">
            <Radio.IndicatorPrimitive data-part="IndicatorPrimitive" />
        </Radio.Root>
    );
}
