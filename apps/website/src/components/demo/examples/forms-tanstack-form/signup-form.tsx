import './signup-form.css';

import { useForm } from '@tanstack/react-form';

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

export default function SignupForm() {
    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
            passwordCheck: '',
            name: '',
            job: '',
            agreeAll: false,
            termsOfService: false,
            personalInfoCollection: false,
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
            <VStack gap="$400">
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
                                    className="input-label"
                                >
                                    이메일
                                    <TextInput
                                        id="signup-email"
                                        size="lg"
                                        type="email"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                </Box>
                                {field.state.meta.errors.length > 0 && (
                                    <Field.Error match>
                                        {field.state.meta.errors[0]}
                                    </Field.Error>
                                )}
                            </Field.Root>
                        )}
                    </form.Field>

                    <form.Field
                        name="password"
                        validators={{
                            onChange: ({ value }) => {
                                if (!value) return '비밀번호를 입력해주세요.';
                                if (
                                    !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}/.test(value)
                                )
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
                                    className="input-label"
                                >
                                    비밀번호
                                    <TextInput
                                        id="signup-password"
                                        size="lg"
                                        type="password"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                </Box>
                                <Field.Description>
                                    8~16자, 대소문자 영문, 숫자, 특수문자 포함
                                </Field.Description>
                                {field.state.meta.errors.length > 0 && (
                                    <Field.Error match>
                                        {field.state.meta.errors[0]}
                                    </Field.Error>
                                )}
                            </Field.Root>
                        )}
                    </form.Field>

                    <form.Field
                        name="passwordCheck"
                        validators={{
                            onChangeListenTo: ['password'],
                            onChange: ({ value, fieldApi }) => {
                                if (!value) return '비밀번호를 입력해주세요.';
                                const password = fieldApi.form.getFieldValue('password');
                                if (value !== password) return '비밀번호를 다시 확인해주세요.';
                                return undefined;
                            },
                        }}
                    >
                        {(field) => (
                            <Field.Root invalid={field.state.meta.errors.length > 0}>
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
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                </Box>
                                <Field.Description>
                                    8~16자, 대소문자 영문, 특수문자 포함
                                </Field.Description>
                                {field.state.meta.errors.length > 0 && (
                                    <Field.Error match>
                                        {field.state.meta.errors[0]}
                                    </Field.Error>
                                )}
                            </Field.Root>
                        )}
                    </form.Field>

                    <form.Field
                        name="name"
                        validators={{
                            onChange: ({ value }) => {
                                if (!value) return '이름을 입력해주세요.';
                                return undefined;
                            },
                        }}
                    >
                        {(field) => (
                            <Field.Root invalid={field.state.meta.errors.length > 0}>
                                <Box
                                    render={<Field.Label />}
                                    flexDirection="column"
                                    className="input-label"
                                >
                                    이름
                                    <TextInput
                                        id="signup-name"
                                        size="lg"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                </Box>
                                {field.state.meta.errors.length > 0 && (
                                    <Field.Error match>
                                        {field.state.meta.errors[0]}
                                    </Field.Error>
                                )}
                            </Field.Root>
                        )}
                    </form.Field>

                    <form.Field name="job">
                        {(field) => (
                            <Field.Root>
                                <Select.Root
                                    items={jobs}
                                    placeholder="직업을 선택해주세요."
                                    size="lg"
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value as string)}
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
                            </Field.Root>
                        )}
                    </form.Field>
                </VStack>

                <VStack gap="$300">
                    <VStack justifyContent="space-between" gap="$050">
                        <form.Field name="agreeAll">
                            {(field) => (
                                <Field.Root>
                                    <Box
                                        render={<Field.Label />}
                                        alignItems="center"
                                        className="checkbox-label"
                                    >
                                        <Checkbox.Root
                                            id="signup-agree-all"
                                            checked={field.state.value}
                                            onCheckedChange={(checked) =>
                                                field.handleChange(checked === true)
                                            }
                                        />
                                        필수 약관에 모두 동의
                                    </Box>
                                </Field.Root>
                            )}
                        </form.Field>
                        <form.Field name="termsOfService">
                            {(field) => (
                                <Field.Root>
                                    <HStack
                                        width="100%"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Box
                                            render={<Field.Label />}
                                            alignItems="center"
                                            className="checkbox-label"
                                        >
                                            <Checkbox.Root
                                                id="signup-terms-of-service"
                                                checked={field.state.value}
                                                onCheckedChange={(checked) =>
                                                    field.handleChange(checked === true)
                                                }
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
                            )}
                        </form.Field>
                        <form.Field name="personalInfoCollection">
                            {(field) => (
                                <Field.Root>
                                    <HStack
                                        width="100%"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Box
                                            render={<Field.Label />}
                                            alignItems="center"
                                            className="checkbox-label"
                                        >
                                            <Checkbox.Root
                                                id="signup-personal-info-collection"
                                                checked={field.state.value}
                                                onCheckedChange={(checked) =>
                                                    field.handleChange(checked === true)
                                                }
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
                            )}
                        </form.Field>
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
