//@ts-nocheck
import { Field, TextInput } from '@vapor-ui/core';
import { NoticeCircleIcon } from '@vapor-ui/icons';

export default function App() {
    const [value, setValue] = useState('');
    const isValid = true;

    return (
        <Field.Root>
            <Field.Label className="label-class">
                <Icon size="16" />
                <Text>Platform Name</Text>
                <TextInput
                    size="lg"
                    value={value}
                    onValueChange={setValue}
                    invalid={!isValid}
                    placeholder="https://example.com"
                />
            </Field.Label>
            {!isValid && (
                <Text className="error-message" as="div">
                    <NoticeCircleIcon />
                    <span>Invalid URL</span>
                </Text>
            )}
        </Field.Root>
    );
}
