import { TextInput } from '@vapor-ui/core';

export default function TextInputReadOnly() {
    return (
        <div className="space-y-3 flex flex-col">
            <TextInput readOnly defaultValue="수정할 수 없는 값" />
            <TextInput type="email" readOnly defaultValue="user@example.com" />
        </div>
    );
}
