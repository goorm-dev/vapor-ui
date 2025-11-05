import './login-form.css';

import {
    Box,
    Button,
    Checkbox,
    Field,
    Form,
    HStack,
    Text,
    TextInput,
    VStack,
} from '@vapor-ui/core';

export default function LoginForm() {
    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            className="login"
            render={<Form onSubmit={(event) => event.preventDefault()} />}
        >
            <VStack gap="$200">
                <Field.Root>
                    <Box
                        render={<Field.Label />}
                        flexDirection="column"
                        justifyContent="space-between"
                    >
                        <Text typography="subtitle2" foreground="normal-200">
                            이메일
                        </Text>
                        <TextInput id="login-email" size="lg" required type="email" />
                    </Box>
                    <Field.Error match="valueMissing">이메일을 입력해주세요.</Field.Error>
                    <Field.Error match="typeMismatch">유효한 이메일 형식이 아닙니다.</Field.Error>
                </Field.Root>

                <Field.Root>
                    <Box
                        render={<Field.Label />}
                        flexDirection="column"
                        justifyContent="space-between"
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
                    </Box>
                    <Field.Description>8~16자, 대소문자 영문, 특수문자 포함</Field.Description>
                    <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                    <Field.Error match="patternMismatch">
                        유효한 비밀번호 형식이 아닙니다.
                    </Field.Error>
                </Field.Root>
            </VStack>
            <VStack gap="$100">
                <HStack justifyContent="space-between">
                    <Field.Root>
                        <Box render={<Field.Label />} alignItems="center">
                            <Checkbox.Root id="login-auto-login" />
                            자동 로그인
                        </Box>
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
