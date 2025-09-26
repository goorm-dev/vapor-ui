import { TextInput } from '@vapor-ui/core';

export default function TextInputStates() {
    return (
        <div className="space-y-4 flex flex-col">
            <TextInput placeholder="Default state" />
            <TextInput disabled placeholder="Disabled state" />
            <TextInput invalid placeholder="Invalid state" />
            <TextInput readOnly value="Read only value" />
        </div>
    );
}
