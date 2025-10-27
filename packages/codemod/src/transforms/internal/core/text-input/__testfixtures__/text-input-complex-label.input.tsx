//@ts-nocheck
import { TextInput } from '@goorm-dev/vapor-core';
import { NoticeCircleIcon } from '@vapor-ui/icons';

export default function App() {
    const [value, setValue] = useState('');
    const isValid = true;

    return (
        <TextInput
            size="lg"
            value={value}
            onValueChange={setValue}
            invalid={!isValid}
        >
            <TextInput.Label className="label-class">
                <Icon size="16" />
                <Text>Platform Name</Text>
            </TextInput.Label>
            <div className="input-wrapper">
                <TextInput.Field placeholder="https://example.com" />
                {!isValid && (
                    <Text className="error-message" as="div">
                        <NoticeCircleIcon />
                        <span>Invalid URL</span>
                    </Text>
                )}
            </div>
        </TextInput>
    );
}
