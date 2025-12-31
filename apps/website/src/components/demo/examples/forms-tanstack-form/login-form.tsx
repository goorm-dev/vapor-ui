import './login-form.css';

import { useForm } from '@tanstack/react-form';
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
    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
            autoLogin: false,
        },
        onSubmit: async ({ value }) => {
            console.log('Form submitted:', value);
        },
    });

    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            className="login"
            render={
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                />
            }
        >
            <VStack gap="$200">
                <form.Field
                    name="email"
                    validators={{
                        onChange: ({ value }) => {
                            if (!value) return '이메일을 입력해주세요.';
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                                return '유효한 이메일 형식이 아닙니다.';
                            return undefined;
                        },
                    }}
                >
                    {(field) => (
                        <Field.Root invalid={field.state.meta.errors.length > 0}>
                            <Box
                                render={<Field.Label />}
                                flexDirection="column"
                                justifyContent="space-between"
                            >
                                <Text typography="subtitle2" foreground="normal-200">
                                    이메일
                                </Text>
                                <TextInput
                                    id="login-email"
                                    size="lg"
                                    type="email"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                />
                            </Box>
                            {field.state.meta.errors.length > 0 && (
                                <Field.Error match>{field.state.meta.errors[0]}</Field.Error>
                            )}
                        </Field.Root>
                    )}
                </form.Field>

                <form.Field
                    name="password"
                    validators={{
                        onChange: ({ value }) => {
                            if (!value) return '비밀번호를 입력해주세요.';
                            if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}/.test(value))
                                return '유효한 비밀번호 형식이 아닙니다.';
                            return undefined;
                        },
                    }}
                >
                    {(field) => (
                        <Field.Root invalid={field.state.meta.errors.length > 0}>
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
                                    size="lg"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                />
                            </Box>
                            <Field.Description>
                                8~16자, 대소문자 영문, 특수문자 포함
                            </Field.Description>
                            {field.state.meta.errors.length > 0 && (
                                <Field.Error match>{field.state.meta.errors[0]}</Field.Error>
                            )}
                        </Field.Root>
                    )}
                </form.Field>
            </VStack>
            <VStack gap="$100">
                <HStack justifyContent="space-between">
                    <form.Field name="autoLogin">
                        {(field) => (
                            <Field.Root>
                                <Box render={<Field.Label />} alignItems="center">
                                    <Checkbox.Root
                                        id="login-auto-login"
                                        checked={field.state.value}
                                        onCheckedChange={(checked) =>
                                            field.handleChange(checked === true)
                                        }
                                    />
                                    자동 로그인
                                </Box>
                            </Field.Root>
                        )}
                    </form.Field>

                    <Button type="button" variant="ghost" colorPalette="secondary">
                        ID/비밀번호 찾기
                    </Button>
                </HStack>

                <Button type="submit" size="lg">
                    로그인
                </Button>
                <Button size="lg" colorPalette="secondary" variant="outline">
                    회원가입
                </Button>
            </VStack>
        </VStack>
    );
}
