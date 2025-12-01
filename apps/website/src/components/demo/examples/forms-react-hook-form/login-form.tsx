import './login-form.css';

import { Controller, useForm } from 'react-hook-form';

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

interface LoginFormData {
    email: string;
    password: string;
    autoLogin: boolean;
}

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
            autoLogin: false,
        },
    });

    const onSubmit = (data: LoginFormData) => {
        console.log('Login form submitted:', data);
    };

    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            className="login"
            render={<Form onSubmit={handleSubmit(onSubmit)} />}
        >
            <VStack gap="$200">
                <Field.Root invalid={!!errors.email}>
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
                            {...register('email', {
                                required: '이메일을 입력해주세요.',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: '유효한 이메일 형식이 아닙니다.',
                                },
                            })}
                        />
                    </Box>
                    {errors.email && <Field.Error>{errors.email.message}</Field.Error>}
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
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
                            {...register('password', {
                                required: '비밀번호를 입력해주세요.',
                                pattern: {
                                    value: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}/,
                                    message: '유효한 비밀번호 형식이 아닙니다.',
                                },
                            })}
                        />
                    </Box>
                    <Field.Description>8~16자, 대소문자 영문, 특수문자 포함</Field.Description>
                    {errors.password && <Field.Error>{errors.password.message}</Field.Error>}
                </Field.Root>
            </VStack>
            <VStack gap="$100">
                <HStack justifyContent="space-between">
                    <Field.Root>
                        <Box render={<Field.Label />} alignItems="center">
                            <Controller
                                name="autoLogin"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox.Root
                                        id="login-auto-login"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            자동 로그인
                        </Box>
                    </Field.Root>

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
