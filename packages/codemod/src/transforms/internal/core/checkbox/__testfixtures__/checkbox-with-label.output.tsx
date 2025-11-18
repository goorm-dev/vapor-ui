import { Checkbox, Field } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Field.Root>
            <Field.Label>
                <Checkbox.Root id="terms" size="md" invalid={false}>
                    <Checkbox.IndicatorPrimitive />
                </Checkbox.Root>
                약관에 동의합니다
            </Field.Label>
        </Field.Root>
    </div>
);
