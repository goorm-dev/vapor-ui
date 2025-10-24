import { Button } from '@vapor-ui/core';
import { TextInput } from '@goorm-dev/vapor-core';

export function MergeImportsExample() {
    return (
        <div>
            <TextInput size="md">
                <TextInput.Field placeholder="Enter text" />
            </TextInput>
            <Button>Submit</Button>
        </div>
    );
}
