'use client';

import { useState } from 'react';

import { Button, Field, Form, Text, TextInput, VStack } from '@vapor-ui/core';

export default function FieldControlled() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        alert(`[제출된 값]\n- 이름: ${firstName}\n- 성: ${lastName}\n- 이메일: ${email}`);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <VStack $css={{ gap: '$200', width: '300px' }}>
                <Field.Root name="firstName">
                    <Field.Label $css={{ flexDirection: 'column' }}>
                        이름
                        <TextInput
                            value={firstName}
                            onValueChange={(value) => setFirstName(value)}
                            placeholder="이름을 입력하세요"
                        />
                    </Field.Label>

                    <Text typography="body3" foreground="hint-200">
                        현재 값: {firstName || '(비어있음)'}
                    </Text>
                </Field.Root>

                <Field.Root name="lastName">
                    <Field.Label $css={{ flexDirection: 'column' }}>
                        성
                        <TextInput
                            value={lastName}
                            onValueChange={(value) => setLastName(value)}
                            placeholder="성을 입력하세요"
                        />
                    </Field.Label>

                    <Text typography="body3" foreground="hint-200">
                        현재 값: {lastName || '(비어있음)'}
                    </Text>
                </Field.Root>

                <Field.Root name="email" validationMode="onChange">
                    <Field.Label $css={{ flexDirection: 'column' }}>
                        이메일
                        <TextInput
                            type="email"
                            required
                            value={email}
                            onValueChange={(value) => setEmail(value)}
                            placeholder="이메일을 입력하세요"
                        />
                    </Field.Label>

                    <Text typography="body3" foreground="hint-200">
                        현재 값: {email || '(비어있음)'}
                    </Text>

                    <Field.Error match="typeMismatch">올바른 이메일 형식이 아닙니다.</Field.Error>
                    <Field.Error match="valueMissing">이메일을 입력해주세요.</Field.Error>
                    <Field.Success>유효한 이메일 형식입니다.</Field.Success>
                </Field.Root>

                <Button>제출</Button>
            </VStack>
        </Form>
    );
}
