import { Button, RadioGroup, Radio } from '@vapor-ui/core';

export function Example() {
    return (
        <>
            <RadioGroup.Root defaultValue="1">
                <Radio.Root value="1" />
            </RadioGroup.Root>
            <Button>Submit</Button>
        </>
    );
}
