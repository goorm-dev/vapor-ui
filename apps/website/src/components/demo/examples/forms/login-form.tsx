import './login-form.css';

import { Button, Checkbox, Field, Form, HStack, Text, TextInput, VStack } from '@vapor-ui/core';

export default function LoginForm() {
    return (
        <VStack
            className="login"
            render={<Form onSubmit={(event) => event.preventDefault()} />}
            $css={{
                gap: '$250',
                width: '100%',
                padding: '$300',
                borderRadius: '$300',
                border: '1px solid var(--vapor-color-border-normal)',
            }}
        >
            <VStack $css={{ gap: '$200' }}>
                <Field.Root>
                    <Field.Label
                        $css={{ flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                        <Text typography="subtitle2" foreground="normal-200">
                            이메일
                        </Text>
                        <TextInput id="login-email" size="lg" required type="email" />
                    </Field.Label>
                    <Field.Error match="valueMissing">이메일을 입력해주세요.</Field.Error>
                    <Field.Error match="typeMismatch">유효한 이메일 형식이 아닙니다.</Field.Error>
                </Field.Root>

                <Field.Root>
                    <Field.Label
                        $css={{ flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                        <Text typography="subtitle2" foreground="normal-200">
                            비밀번호
                        </Text>
                        <TextInput
                            id="login-password"
                            type="password"
                            required
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}"
                            size="lg"
                        />
                    </Field.Label>
                    <Field.Description>8~16자, 대소문자 영문, 특수문자 포함</Field.Description>
                    <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                    <Field.Error match="patternMismatch">
                        유효한 비밀번호 형식이 아닙니다.
                    </Field.Error>
                </Field.Root>
            </VStack>
            <VStack $css={{ gap: '$100' }}>
                <HStack $css={{ justifyContent: 'space-between' }}>
                    <Field.Root>
                        <Field.Item>
                            <Checkbox.Root id="login-auto-login" />
                            <Field.Label>자동 로그인</Field.Label>
                        </Field.Item>
                    </Field.Root>

                    <Button type="button" variant="ghost" colorPalette="secondary">
                        ID/비밀번호 찾기
                    </Button>
                </HStack>

                <Button size="lg">로그인</Button>
                <Button size="lg" colorPalette="secondary" variant="outline">
                    회원가입
                </Button>
            </VStack>
        </VStack>
    );
}
