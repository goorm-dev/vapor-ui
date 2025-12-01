import './signup-form.css';

import { Controller, useForm } from 'react-hook-form';

import {
    Box,
    Button,
    Checkbox,
    Field,
    Form,
    HStack,
    IconButton,
    Select,
    Text,
    TextInput,
    VStack,
} from '@vapor-ui/core';
import { ChevronRightOutlineIcon } from '@vapor-ui/icons';

const jobs = [
    { label: '개발자', value: 'developer' },
    { label: '디자이너', value: 'designer' },
    { label: '프로덕트 매니저', value: 'product-manager' },
    { label: '기타', value: 'etc' },
];

interface SignupFormData {
    email: string;
    password: string;
    passwordConfirm: string;
    name: string;
    job: string;
    agreeAll: boolean;
    termsOfService: boolean;
    personalInfoCollection: boolean;
}

export default function SignupForm() {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<SignupFormData>({
        defaultValues: {
            email: '',
            password: '',
            passwordConfirm: '',
            name: '',
            job: '',
            agreeAll: false,
            termsOfService: false,
            personalInfoCollection: false,
        },
    });

    const password = watch('password');

    const onSubmit = (data: SignupFormData) => {
        console.log('Signup form submitted:', data);
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
            <VStack gap="$400">
                <VStack gap="$200">
                    <Field.Root invalid={!!errors.email}>
                        <Box
                            render={<Field.Label />}
                            flexDirection="column"
                            className="input-label"
                        >
                            이메일
                            <TextInput
                                id="signup-email"
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
                            className="input-label"
                        >
                            비밀번호
                            <TextInput
                                id="signup-password"
                                size="lg"
                                type="password"
                                {...register('password', {
                                    required: '비밀번호를 입력해주세요.',
                                    pattern: {
                                        value: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}/,
                                        message: '유효한 비밀번호 형식이 아닙니다.',
                                    },
                                })}
                            />
                        </Box>
                        <Field.Description>
                            8~16자, 대소문자 영문, 숫자, 특수문자 포함
                        </Field.Description>
                        {errors.password && <Field.Error>{errors.password.message}</Field.Error>}
                    </Field.Root>

                    <Field.Root invalid={!!errors.passwordConfirm}>
                        <Box
                            render={<Field.Label />}
                            flexDirection="column"
                            className="input-label"
                        >
                            비밀번호 확인
                            <TextInput
                                id="signup-password-check"
                                size="lg"
                                type="password"
                                {...register('passwordConfirm', {
                                    required: '비밀번호를 입력해주세요.',
                                    validate: (value) =>
                                        value === password || '비밀번호를 다시 확인해주세요.',
                                })}
                            />
                        </Box>
                        <Field.Description>8~16자, 대소문자 영문, 특수문자 포함</Field.Description>
                        {errors.passwordConfirm && (
                            <Field.Error>{errors.passwordConfirm.message}</Field.Error>
                        )}
                    </Field.Root>

                    <Field.Root invalid={!!errors.name}>
                        <Box
                            render={<Field.Label />}
                            flexDirection="column"
                            className="input-label"
                        >
                            이름
                            <TextInput
                                id="signup-name"
                                size="lg"
                                {...register('name', {
                                    required: '이름을 입력해주세요.',
                                })}
                            />
                        </Box>
                        {errors.name && <Field.Error>{errors.name.message}</Field.Error>}
                    </Field.Root>

                    <Field.Root>
                        <Controller
                            name="job"
                            control={control}
                            render={({ field }) => (
                                <Select.Root
                                    items={jobs}
                                    placeholder="직업을 선택해주세요."
                                    size="lg"
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <Box
                                        render={<Field.Label htmlFor="signup-jobs" />}
                                        flexDirection="column"
                                        className="input-label"
                                    >
                                        직업
                                        <Select.Trigger id="signup-jobs" />
                                    </Box>

                                    <Select.Popup>
                                        {jobs.map((job) => (
                                            <Select.Item key={job.value} value={job.value}>
                                                {job.label}
                                            </Select.Item>
                                        ))}
                                    </Select.Popup>
                                </Select.Root>
                            )}
                        />
                    </Field.Root>
                </VStack>

                <VStack gap="$300">
                    <VStack justifyContent="space-between" gap="$050">
                        <Field.Root>
                            <Box
                                render={<Field.Label />}
                                alignItems="center"
                                className="checkbox-label"
                            >
                                <Controller
                                    name="agreeAll"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="signup-agree-all"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                필수 약관에 모두 동의
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <HStack width="100%" justifyContent="space-between" alignItems="center">
                                <Box
                                    render={<Field.Label />}
                                    alignItems="center"
                                    className="checkbox-label"
                                >
                                    <Controller
                                        name="termsOfService"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox.Root
                                                id="signup-terms-of-service"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    이용 약관 동의
                                </Box>
                                <IconButton
                                    type="button"
                                    size="sm"
                                    colorPalette="secondary"
                                    variant="ghost"
                                    aria-label="약관 보기"
                                >
                                    <ChevronRightOutlineIcon />
                                </IconButton>
                            </HStack>
                        </Field.Root>
                        <Field.Root>
                            <HStack width="100%" justifyContent="space-between" alignItems="center">
                                <Box
                                    render={<Field.Label />}
                                    alignItems="center"
                                    className="checkbox-label"
                                >
                                    <Controller
                                        name="personalInfoCollection"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox.Root
                                                id="signup-personal-info-collection"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    개인 정보 수집 이용 동의
                                </Box>
                                <IconButton
                                    type="button"
                                    size="sm"
                                    colorPalette="secondary"
                                    variant="ghost"
                                    aria-label="개인 정보 수집 이용 보기"
                                >
                                    <ChevronRightOutlineIcon />
                                </IconButton>
                            </HStack>
                        </Field.Root>
                    </VStack>

                    <Button type="submit" size="lg">
                        회원가입
                    </Button>
                </VStack>
            </VStack>

            <HStack justifyContent={'center'}>
                <Text typography="body2">이미 계정이 있으세요?</Text>
                <Button type="button" size="sm" variant="ghost">
                    로그인
                </Button>
            </HStack>
        </VStack>
    );
}
