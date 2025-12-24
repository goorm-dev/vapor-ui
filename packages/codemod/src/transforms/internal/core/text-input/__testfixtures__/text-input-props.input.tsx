import { TextInput } from '@goorm-dev/vapor-core';

export function PropsExample() {
    return (
        <TextInput size="lg" invalid disabled className="custom-input">
            <TextInput.Field
                placeholder="Disabled input"
                type="password"
                maxLength={20}
                readOnly
                required
            />
        </TextInput>
    );
}
