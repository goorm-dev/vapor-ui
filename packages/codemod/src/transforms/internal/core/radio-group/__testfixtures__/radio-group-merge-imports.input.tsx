import { Button } from '@vapor-ui/core';
import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <>
            <RadioGroup defaultSelectedValue="1">
                <RadioGroup.Item>
                    <RadioGroup.Indicator value="1" />
                </RadioGroup.Item>
            </RadioGroup>
            <Button>Submit</Button>
        </>
    );
}
