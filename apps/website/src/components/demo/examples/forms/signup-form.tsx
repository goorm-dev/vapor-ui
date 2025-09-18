import { Button, Checkbox, HStack, Select, Text, TextInput, VStack } from '@vapor-ui/core';
import { ChevronRightOutlineIcon } from '@vapor-ui/icons';

const jobs = [
    { label: '개발자', value: 'developer' },
    { label: '디자이너', value: 'designer' },
    { label: '프로덕트 매니저', value: 'product-manager' },
    { label: '기타', value: 'etc' },
];

export default function LoginForm() {
    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid #eee"
            className="login"
        >
            <VStack gap="$400">
                <VStack gap="$200">
                    <VStack gap="$100">
                        <label htmlFor="email" className="input-label">
                            이메일
                        </label>
                        <TextInput id="email" />
                    </VStack>
                    <VStack gap="$100">
                        <label htmlFor="password" className="input-label">
                            비밀번호
                        </label>
                        <VStack gap="$050">
                            <TextInput id="password" />
                            <span className="helper-text">8~16자, 영문, 특수문자 포함</span>
                        </VStack>
                    </VStack>
                    <VStack gap="$100">
                        <label htmlFor="password-check" className="input-label">
                            비밀번호 확인
                        </label>
                        <VStack gap="$050">
                            <TextInput id="password-check" />
                            <span className="helper-text">8~16자, 영문, 특수문자 포함</span>
                        </VStack>
                    </VStack>

                    <VStack gap="$100">
                        <label htmlFor="name" className="input-label">
                            이름
                        </label>
                        <TextInput id="name" />
                    </VStack>
                    <VStack gap="$100">
                        <label htmlFor="jobs" className="input-label">
                            직업
                        </label>
                        <Select.Root items={jobs} placeholder="직업을 선택해주세요.">
                            <Select.Trigger id="jobs">
                                <Select.Value />
                                <Select.TriggerIcon />
                            </Select.Trigger>
                            <Select.Content>
                                {jobs.map((job) => (
                                    <Select.Item key={job.value} value={job.value}>
                                        {job.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </VStack>
                </VStack>

                <VStack gap="$300">
                    <VStack justifyContent="space-between" gap="$050">
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="agree-all" />
                            <HStack
                                render={<label htmlFor="agree-all" className="checkbox-label" />}
                                justifyContent="space-between"
                            >
                                필수 약관에 모두 동의
                            </HStack>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="terms-of-service" />
                            <HStack
                                render={
                                    <label htmlFor="terms-of-service" className="checkbox-label" />
                                }
                                width="100%"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                이용 약관 동의
                                <ChevronRightOutlineIcon />
                            </HStack>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="personal-info-collection" />
                            <HStack
                                render={
                                    <label
                                        htmlFor="personal-info-collection"
                                        className="checkbox-label"
                                    />
                                }
                                width="100%"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                개인 정보 수집 이용 동의
                                <ChevronRightOutlineIcon />
                            </HStack>
                        </HStack>

                        <Button size="lg" style={{ marginTop: 'var(--vapor-size-space-300)' }}>
                            회원가입
                        </Button>
                    </VStack>
                </VStack>
            </VStack>

            <HStack justifyContent={'center'}>
                <Text typography="body2">이미 계정이 있으세요?</Text>
                <Button size="sm" variant="ghost">
                    로그인
                </Button>
            </HStack>
        </VStack>
    );
}
