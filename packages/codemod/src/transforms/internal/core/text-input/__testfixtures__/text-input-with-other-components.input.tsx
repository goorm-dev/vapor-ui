import { TextInput, Button } from '@goorm-dev/vapor-core';

export function WithOtherComponentsExample() {
    return (
        <div>
            <TextInput size="md">
                <TextInput.Field placeholder="Enter text" />
            </TextInput>
            <Button>Submit</Button>
        </div>
    );
}
