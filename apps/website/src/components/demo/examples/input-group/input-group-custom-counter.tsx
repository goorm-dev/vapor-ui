'use client';

import { InputGroup, Text, TextInput, VStack } from '@vapor-ui/core';

export default function InputGroupCustomCounter() {
    return (
        <VStack gap="$300">
            <VStack gap="$050">
                <Text typography="body3" foreground="hint-100">
                    커스텀 카운터 예시 1
                </Text>
                <InputGroup.Root>
                    <TextInput placeholder="메시지를 입력하세요" maxLength={20} />
                    <InputGroup.Counter>
                        {({ count, maxLength }) => `${count} of ${maxLength} characters`}
                    </InputGroup.Counter>
                </InputGroup.Root>
            </VStack>
            <VStack gap="$050">
                <Text typography="body3" foreground="hint-100">
                    커스텀 카운터 예시 2
                </Text>
                <InputGroup.Root>
                    <TextInput placeholder="메시지를 입력하세요" maxLength={100} />
                    <InputGroup.Counter>
                        {({ count, maxLength, value }) => (
                            <Text
                                foreground={
                                    maxLength && count > maxLength * 0.8 ? 'danger-100' : 'hint-100'
                                }
                            >
                                {count}/{maxLength} {value.length > 50 && '(50자 초과)'}
                            </Text>
                        )}
                    </InputGroup.Counter>
                </InputGroup.Root>
            </VStack>
        </VStack>
    );
}
