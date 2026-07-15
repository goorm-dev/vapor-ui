import { useState } from 'react';

import { Box, Button, Callout, Field, Text, TextInput, VStack } from '@vapor-ui/core';

interface ApiKeyFormProps {
    verifying: boolean;
    errorMessage?: string;
    onSubmit: (key: string) => void;
}

export const ApiKeyForm = ({ verifying, errorMessage, onSubmit }: ApiKeyFormProps) => {
    const [value, setValue] = useState('');

    return (
        <Box $css={{ padding: '$200' }}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(value);
                }}
            >
                <VStack $css={{ gap: '$200' }}>
                    <Text typography="heading6">Linear API 키 입력</Text>
                    <Text typography="body2" foreground="hint-100">
                        QA 항목을 Linear에 등록하려면 Personal API 키가 필요합니다.
                    </Text>

                    <Field.Root>
                        <Field.Label>API 키</Field.Label>
                        <TextInput
                            type="password"
                            placeholder="lin_api_..."
                            value={value}
                            onValueChange={setValue}
                        />
                    </Field.Root>

                    {errorMessage && (
                        <Callout.Root colorPalette="danger">
                            <Text typography="body2">{errorMessage}</Text>
                        </Callout.Root>
                    )}

                    <Button type="submit" disabled={verifying || !value.trim()}>
                        {verifying ? '확인 중...' : '확인'}
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};
