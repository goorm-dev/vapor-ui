import { TextInput } from '@vapor-ui/core';

export default function TextInputStates() {
    return (
        <div className="space-y-4">
            <label>
                Default
                <TextInput placeholder="Default state" />
            </label>
            <label>
                Disabled
                <TextInput disabled placeholder="Disabled state" />
            </label>
            <label>
                Invalid
                <TextInput invalid placeholder="Invalid state" />
            </label>
            <label>
                Read Only
                <TextInput readOnly value="Read only value" />
            </label>
        </div>
    );
}
