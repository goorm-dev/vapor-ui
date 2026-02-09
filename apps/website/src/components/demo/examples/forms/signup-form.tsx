import './signup-form.css';

import { useState } from 'react';

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
    const [passwordCheck, setPasswordCheck] = useState('');
    // const passwordCheck = useRef<string>('');

    return (
        <VStack
            className="login"
            render={<Form onSubmit={(event) => event.preventDefault()} />}
            $styles={{
                gap: '$250',
                width: '100%',
                padding: '$300',
                borderRadius: '$300',
                border: '1px solid var(--vapor-color-border-normal)',
            }}
        >
            <VStack $styles={{ gap: '$400' }}>
                <VStack $styles={{ gap: '$200' }}>
                    <Field.Root>
                        <Box
                            render={<Field.Label />}
                            className="input-label"
                            $styles={{ flexDirection: 'column' }}
                        >
                            이메일
                            <TextInput id="signup-email" size="lg" required type="email" />
                        </Box>
                        <Field.Error match="valueMissing">이메일을 입력해주세요.</Field.Error>
                        <Field.Error match="typeMismatch">
                            유효한 이메일 형식이 아닙니다.
                        </Field.Error>
                    </Field.Root>

                    <Field.Root>
                        <Box
                            render={<Field.Label />}
                            className="input-label"
                            $styles={{ flexDirection: 'column' }}
                        >
                            비밀번호
                            <TextInput
                                id="signup-password"
                                size="lg"
                                type="password"
                                onValueChange={(value) => setPasswordCheck(value)}
                                required
                                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}"
                            />
                        </Box>
                        <Field.Description>
                            8~16자, 대소문자 영문, 숫자, 특수문자 포함
                        </Field.Description>
                        <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                        <Field.Error match="patternMismatch">
                            유효한 비밀번호 형식이 아닙니다.
                        </Field.Error>
                    </Field.Root>

                    <Field.Root>
                        <Box
                            render={<Field.Label />}
                            className="input-label"
                            $styles={{ flexDirection: 'column' }}
                        >
                            비밀번호 확인
                            <TextInput
                                id="signup-password-check"
                                size="lg"
                                type="password"
                                required
                                pattern={passwordCheck}
                            />
                        </Box>
                        <Field.Description>8~16자, 대소문자 영문, 특수문자 포함</Field.Description>
                        <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                        <Field.Error match="patternMismatch">
                            비밀번호를 다시 확인해주세요.
                        </Field.Error>
                    </Field.Root>

                    <Field.Root>
                        <Box
                            render={<Field.Label />}
                            className="input-label"
                            $styles={{ flexDirection: 'column' }}
                        >
                            이름
                            <TextInput id="signup-name" size="lg" required />
                        </Box>
                        <Field.Error match="valueMissing">이름을 입력해주세요.</Field.Error>
                    </Field.Root>

                    <Field.Root>
                        <Select.Root items={jobs} placeholder="직업을 선택해주세요." size="lg">
                            <Box
                                render={<Field.Label htmlFor="signup-jobs" />}
                                className="input-label"
                                $styles={{ flexDirection: 'column' }}
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
                </VStack>

                <VStack $styles={{ gap: '$300' }}>
                    <VStack $styles={{ justifyContent: 'space-between', gap: '$050' }}>
                        <Field.Root>
                            <Box
                                render={<Field.Label />}
                                className="checkbox-label"
                                $styles={{ alignItems: 'center' }}
                            >
                                <Checkbox.Root id="signup-agree-all" />
                                필수 약관에 모두 동의
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <HStack
                                $styles={{
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box
                                    render={<Field.Label />}
                                    className="checkbox-label"
                                    $styles={{ alignItems: 'center' }}
                                >
                                    <Checkbox.Root id="signup-terms-of-service" />
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
                            <HStack
                                $styles={{
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box
                                    render={<Field.Label />}
                                    className="checkbox-label"
                                    $styles={{ alignItems: 'center' }}
                                >
                                    <Checkbox.Root id="signup-personal-info-collection" />
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

                    <Button size="lg">회원가입</Button>
                </VStack>
            </VStack>

            <HStack $styles={{ justifyContent: 'center' }}>
                <Text typography="body2">이미 계정이 있으세요?</Text>
                <Button type="button" size="sm" variant="ghost">
                    로그인
                </Button>
            </HStack>
        </VStack>
    );
}
