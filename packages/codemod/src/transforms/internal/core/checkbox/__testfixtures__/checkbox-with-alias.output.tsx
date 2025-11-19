import { Field, Checkbox as VaporCheckbox } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Field.Root>
            <Field.Label>
                <VaporCheckbox.Root id="terms" size="md">
                    <VaporCheckbox.IndicatorPrimitive />
                </VaporCheckbox.Root>
                약관에 동의합니다
            </Field.Label>
        </Field.Root>
    </div>
);
