import './login-form.css';

import { Button, Checkbox, Field, Form, HStack, TextInput, VStack } from '@vapor-ui/core';

export default function LoginForm() {
    return (
        <VStack
            gap="$250"
            width="100%"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            className="login"
            render={<Form onSubmit={(event) => event.preventDefault()} />}
        >
            <VStack gap="$200">
                <Field.Root render={<VStack gap="$100" />}>
                    <Field.Label className="input-label">이메일</Field.Label>
                    <TextInput id="login-email" size="lg" required type="email" />
                    <Field.Error match="valueMissing">이메일을 입력해주세요.</Field.Error>
                    <Field.Error match="typeMismatch">유효한 이메일 형식이 아닙니다.</Field.Error>
                </Field.Root>

                <Field.Root render={<VStack gap="$100" />}>
                    <Field.Label className="input-label">비밀번호</Field.Label>
                    <TextInput
                        id="login-password"
                        size="lg"
                        type="password"
                        required
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}"
                    />
                    <Field.Description>8~16자, 대소문자 영문, 특수문자 포함</Field.Description>
                    <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                    <Field.Error match="patternMismatch">
                        유효한 비밀번호 형식이 아닙니다.
                    </Field.Error>
                </Field.Root>
            </VStack>
            <VStack gap="$100">
                <HStack justifyContent="space-between">
                    <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                        <Checkbox.Root id="login-auto-login" />
                        <Field.Label className="checkbox-label">자동 로그인</Field.Label>
                    </Field.Root>

                    <Button type="button" variant="ghost" color="secondary">
                        ID/비밀번호 찾기
                    </Button>
                </HStack>

                <Button size="lg">로그인</Button>
                <Button size="lg" color="secondary" variant="outline">
                    회원가입
                </Button>
            </VStack>
        </VStack>
    );
}
