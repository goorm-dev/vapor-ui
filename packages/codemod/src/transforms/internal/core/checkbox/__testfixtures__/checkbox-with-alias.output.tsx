import { Field, Checkbox as VaporCheckbox } from '@vapor-ui/core';

export const Component = () => (
    <div>
        <Field.Label>
            <VaporCheckbox.Root id="terms" size="md">
                <VaporCheckbox.Indicator />
            </VaporCheckbox.Root>
            약관에 동의합니다
        </Field.Label>
    </div>
);
