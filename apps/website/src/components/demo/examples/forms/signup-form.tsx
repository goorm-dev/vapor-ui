import './signup-form.css';

import { useState } from 'react';

import {
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
    const [passwordCheck, setPasswordCheck] = useState('');
    // const passwordCheck = useRef<string>('');

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
            <VStack gap="$400">
                <VStack gap="$200">
                    <Field.Root render={<VStack gap="$100" />}>
                        <Field.Label className="input-label">이메일</Field.Label>
                        <TextInput id="signup-email" size="lg" required type="email" />
                        <Field.Error match="valueMissing">이메일을 입력해주세요.</Field.Error>
                        <Field.Error match="typeMismatch">
                            유효한 이메일 형식이 아닙니다.
                        </Field.Error>
                    </Field.Root>

                    <Field.Root render={<VStack gap="$100" />}>
                        <Field.Label className="input-label">비밀번호</Field.Label>
                        <TextInput
                            id="signup-password"
                            size="lg"
                            type="password"
                            onValueChange={(value) => {
                                setPasswordCheck(value);
                            }}
                            required
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}"
                        />
                        <Field.Description>
                            8~16자, 대소문자 영문, 숫자, 특수문자 포함
                        </Field.Description>
                        <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                        <Field.Error match="patternMismatch">
                            유효한 비밀번호 형식이 아닙니다.
                        </Field.Error>
                    </Field.Root>

                    <Field.Root render={<VStack gap="$100" />}>
                        <Field.Label className="input-label">비밀번호 확인</Field.Label>
                        <TextInput
                            id="signup-password-check"
                            size="lg"
                            type="password"
                            required
                            pattern={passwordCheck}
                        />
                        <Field.Description>8~16자, 대소문자 영문, 특수문자 포함</Field.Description>
                        <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                        <Field.Error match="patternMismatch">
                            비밀번호를 다시 확인해주세요.
                        </Field.Error>
                    </Field.Root>

                    <Field.Root render={<VStack gap="$100" />}>
                        <Field.Label className="input-label">이름</Field.Label>
                        <TextInput id="signup-name" size="lg" required />
                        <Field.Error match="valueMissing">이름을 입력해주세요.</Field.Error>
                    </Field.Root>

                    <Field.Root render={<VStack gap="$100" />}>
                        <Field.Label className="input-label">직업</Field.Label>
                        <Select.Root items={jobs} placeholder="직업을 선택해주세요." size="lg">
                            <Select.Trigger id="signup-jobs">
                                <Select.Value />
                                <Select.TriggerIcon />
                            </Select.Trigger>
                            <Select.Content>
                                {jobs.map((job) => (
                                    <Select.Item key={job.value} value={job.value}>
                                        {job.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Field.Root>
                </VStack>

                <VStack gap="$300">
                    <VStack justifyContent="space-between" gap="$050">
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root id="signup-agree-all" />
                            <Field.Label className="checkbox-label">
                                필수 약관에 모두 동의
                            </Field.Label>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root id="signup-terms-of-service" />
                            <HStack width="100%" justifyContent="space-between" alignItems="center">
                                <Field.Label className="checkbox-label">이용 약관 동의</Field.Label>
                                <IconButton
                                    size="sm"
                                    color="secondary"
                                    variant="ghost"
                                    aria-label="약관 보기"
                                >
                                    <ChevronRightOutlineIcon />
                                </IconButton>
                            </HStack>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root id="signup-personal-info-collection" />
                            <HStack width="100%" justifyContent="space-between" alignItems="center">
                                <Field.Label className="checkbox-label">
                                    개인 정보 수집 이용 동의
                                </Field.Label>
                                <IconButton
                                    size="sm"
                                    color="secondary"
                                    variant="ghost"
                                    aria-label="개인 정보 수집 이용 보기"
                                >
                                    <ChevronRightOutlineIcon />
                                </IconButton>
                            </HStack>
                        </Field.Root>
                    </VStack>

                    <Button size="lg">회원가입</Button>
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
