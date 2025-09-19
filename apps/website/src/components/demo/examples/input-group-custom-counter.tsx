import { InputGroup, TextInput } from '@vapor-ui/core';

export default function InputGroupCustomCounter() {
    return (
        <div className="space-y-4">
            <InputGroup.Root>
                <TextInput placeholder="커스텀 카운터 예시 1" maxLength={20} />
                <InputGroup.Counter>
                    {({ count, maxLength }) => `${count} of ${maxLength} characters`}
                </InputGroup.Counter>
            </InputGroup.Root>
            <InputGroup.Root>
                <TextInput placeholder="커스텀 카운터 예시 2" maxLength={100} />
                <InputGroup.Counter>
                    {({ count, maxLength, value }) => (
                        <span
                            className={
                                maxLength && count > maxLength * 0.8
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                            }
                        >
                            {count}/{maxLength} {value.length > 50 && '⚠️'}
                        </span>
                    )}
                </InputGroup.Counter>
            </InputGroup.Root>
        </div>
    );
}
