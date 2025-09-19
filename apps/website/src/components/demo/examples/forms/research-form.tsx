import './research-form.css';

import {
    Button,
    Checkbox,
    HStack,
    Radio,
    RadioGroup,
    Select,
    Switch,
    Text,
    TextInput,
    VStack,
} from '@vapor-ui/core';

const jobs = [
    { label: '프론트엔드 개발자', value: 'frontend-engineer' },
    { label: '백엔드 개발자', value: 'backend-engineer' },
    { label: '풀스택 개발자', value: 'fullstack-engineer' },
    { label: '모바일 앱 개발자', value: 'app-engineer' },
    { label: 'DevOps/클라우드 엔지니어', value: 'devops-engineer' },
];

const stacks = [
    { label: 'HTML/CSS', value: 'html-css' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'React', value: 'react' },
    { label: 'Vue.js', value: 'vue' },
    { label: 'Next.js', value: 'nextjs' },
];

export default function ResearchForm() {
    return (
        <VStack gap="$500" width="400px" padding="$300" borderRadius="$300" border="1px solid #eee">
            <VStack gap="$200">
                <Text typography="heading5">기본 정보를 입력해주세요.</Text>

                <VStack gap="$100">
                    <label htmlFor="research-name" className="input-label">
                        이름
                    </label>
                    <TextInput id="research-name" />
                </VStack>
                <VStack gap="$100">
                    <label htmlFor="research-jobs" className="input-label">
                        직업
                    </label>
                    <Select.Root items={jobs} placeholder="직업을 선택해주세요.">
                        <Select.Trigger id="research-jobs">
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
                <VStack gap="$100">
                    <label htmlFor="research-stack" className="input-label">
                        스택
                    </label>
                    <Select.Root items={stacks} placeholder="자주 사용하는 스택을 선택해주세요.">
                        <Select.Trigger id="research-stack">
                            <Select.Value />
                            <Select.TriggerIcon />
                        </Select.Trigger>
                        <Select.Content>
                            {stacks.map((stack) => (
                                <Select.Item key={stack.value} value={stack.value}>
                                    {stack.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                </VStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="heading5">만족도를 선택해주세요.</Text>
                <RadioGroup.Root defaultValue="fully-satisfied">
                    <HStack gap="$100" alignItems="center">
                        <Radio.Root
                            id="research-fully-satisfied"
                            value="fully-satisfied"
                            size="lg"
                        />
                        <label htmlFor="research-fully-satisfied" className="radio-label">
                            매우 만족
                        </label>
                    </HStack>

                    <HStack gap="$100" alignItems="center">
                        <Radio.Root id="research-neutral" value="neutral" size="lg" />
                        <label htmlFor="research-neutral" className="radio-label">
                            보통
                        </label>
                    </HStack>

                    <HStack gap="$100" alignItems="center">
                        <Radio.Root id="research-not-satisfied" value="not-satisfied" size="lg" />
                        <label htmlFor="research-not-satisfied" className="radio-label">
                            아쉬움
                        </label>
                    </HStack>
                </RadioGroup.Root>
            </VStack>

            <VStack gap="$100">
                <VStack marginBottom="$050">
                    <Text typography="heading5">좋았던 강의는 무엇인가요?</Text>
                    <Text typography="body2" foreground="normal-lighter">
                        중복 선택 가능
                    </Text>
                </VStack>

                <HStack alignItems="center" gap="$100">
                    <Checkbox.Root id="research-mentoring" size="lg" />
                    <label htmlFor="research-mentoring" className="checkbox-label">
                        멘토님 강연 능력
                    </label>
                </HStack>
                <HStack alignItems="center" gap="$100">
                    <Checkbox.Root id="research-topic" size="lg" />
                    <label htmlFor="research-topic" className="checkbox-label">
                        주제(협업 및 커뮤니케이션 스킬)
                    </label>
                </HStack>
                <HStack alignItems="center" gap="$100">
                    <Checkbox.Root id="research-content" size="lg" />
                    <label htmlFor="research-content" className="checkbox-label">
                        전반적인 강의 내용
                    </label>
                </HStack>
                <HStack alignItems="center" gap="$100">
                    <Checkbox.Root id="research-seminar" size="lg" />
                    <label htmlFor="research-seminar" className="checkbox-label">
                        세미나 자료
                    </label>
                </HStack>
                <HStack alignItems="center" gap="$100">
                    <Checkbox.Root id="research-etc" size="lg" />
                    <label htmlFor="research-etc" className="checkbox-label">
                        기타
                    </label>
                </HStack>
            </VStack>

            <VStack gap="$100">
                <Text typography="heading5">개인 정보 수신 동의</Text>

                <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    gap="$100"
                    marginTop="$050"
                >
                    <label htmlFor="research-service" className="checkbox-label">
                        서비스 메일 수신 동의
                    </label>
                    <Switch.Root defaultChecked id="research-service" />
                </HStack>
                <HStack justifyContent="space-between" alignItems="center" gap="$100">
                    <label htmlFor="research-advertising" className="checkbox-label">
                        이벤트성 광고 수신 동의
                    </label>
                    <Switch.Root defaultChecked id="research-advertising" />
                </HStack>
            </VStack>

            <Button size="lg">제출하기</Button>
        </VStack>
    );
}
