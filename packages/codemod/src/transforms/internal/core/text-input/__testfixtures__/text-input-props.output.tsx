import { TextInput } from '@vapor-ui/core';

export function PropsExample() {
    return (
        <TextInput
            size="lg"
            invalid
            disabled
            className="custom-input"
            placeholder="Disabled input"
            type="password"
            maxLength={20}
            readOnly
            required
        />
    );
}
