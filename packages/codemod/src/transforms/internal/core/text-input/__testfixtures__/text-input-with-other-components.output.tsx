import { Button } from '@goorm-dev/vapor-core';

import { TextInput } from '@vapor-ui/core';

export function WithOtherComponentsExample() {
    return (
        <div>
            <TextInput size="md" placeholder="Enter text" />
            <Button>Submit</Button>
        </div>
    );
}
