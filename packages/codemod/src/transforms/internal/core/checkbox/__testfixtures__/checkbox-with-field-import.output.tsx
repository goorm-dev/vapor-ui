import { Checkbox, Field } from '@vapor-ui/core';

export const Component = () => (
    <Field.Root>
        <Field.Label>
            (
            <Checkbox.Root id="terms">
                <Checkbox.IndicatorPrimitive />
            </Checkbox.Root>
            ) Accept terms
        </Field.Label>
    </Field.Root>
);
