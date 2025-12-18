import { Field, Radio, RadioGroup } from '@vapor-ui/core';

export function Example() {
    return (
        <div>
            <RadioGroup.Root defaultValue="a">
                <Field.Label>
                    <Radio.Root value="a" />A
                </Field.Label>
            </RadioGroup.Root>
            <RadioGroup.Root defaultValue="x">
                <Field.Label>
                    <Radio.Root value="x" />X
                </Field.Label>
            </RadioGroup.Root>
        </div>
    );
}
