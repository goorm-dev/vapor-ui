import './research-form.css';

import {
    Button,
    Checkbox,
    Field,
    Form,
    HStack,
    MultiSelect,
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
        <VStack
            gap="$500"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            render={<Form onSubmit={(event) => event.preventDefault()} />}
        >
            <VStack gap="$200">
                <Text typography="heading5">기본 정보를 입력해주세요.</Text>

                <Field.Root render={<VStack gap="$100" />}>
                    <Field.VLabel>
                        이름
                        <TextInput id="research-name" required size="lg" />
                    </Field.VLabel>
                    <Field.Error match="valueMissing">이름을 입력해주세요.</Field.Error>
                </Field.Root>

                <Field.Root>
                    <Field.VLabel htmlFor="research-jobs">
                        직업
                        <Select.Root items={jobs} placeholder="직업을 선택해주세요." size="lg">
                            <Select.Trigger id="research-jobs">
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
                    </Field.VLabel>
                </Field.Root>

                <Field.Root>
                    <Field.VLabel htmlFor="research-stack">
                        스택
                        <MultiSelect.Root
                            items={stacks}
                            placeholder="자주 사용하는 스택을 선택해주세요."
                            size="lg"
                        >
                            <MultiSelect.Trigger id="research-stack">
                                <MultiSelect.Value />
                                <MultiSelect.TriggerIcon />
                            </MultiSelect.Trigger>
                            <MultiSelect.Content>
                                {stacks.map((stack) => (
                                    <MultiSelect.Item key={stack.value} value={stack.value}>
                                        {stack.label}
                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Content>
                        </MultiSelect.Root>
                    </Field.VLabel>
                </Field.Root>
            </VStack>

            <Field.Root>
                <RadioGroup.Root>
                    <RadioGroup.Label>만족도를 선택해주세요.</RadioGroup.Label>
                    <Field.HLabel>
                        <Radio.Root
                            id="research-fully-satisfied"
                            value="fully-satisfied"
                            size="lg"
                        />
                        매우 만족
                    </Field.HLabel>

                    <Field.HLabel>
                        <Radio.Root id="research-neutral" value="neutral" size="lg" />
                        보통
                    </Field.HLabel>

                    <Field.HLabel>
                        <Radio.Root id="research-not-satisfied" value="not-satisfied" size="lg" />
                        불만족
                    </Field.HLabel>
                </RadioGroup.Root>
            </Field.Root>

            <VStack gap="$100">
                <VStack marginBottom="$050">
                    <Text typography="heading5">좋았던 강의는 무엇인가요?</Text>
                    <Text typography="body2" foreground="normal-100">
                        중복 선택 가능
                    </Text>
                </VStack>

                <Field.Root>
                    <Field.HLabel>
                        <Checkbox.Root id="research-mentoring" size="lg" />
                        멘토님 강연 능력
                    </Field.HLabel>
                </Field.Root>

                <Field.Root>
                    <Field.HLabel>
                        <Checkbox.Root id="research-topic" size="lg" />
                        주제(협업 및 커뮤니케이션 스킬)
                    </Field.HLabel>
                </Field.Root>

                <Field.Root>
                    <Field.HLabel>
                        <Checkbox.Root id="research-content" size="lg" />
                        전반적인 강의 내용
                    </Field.HLabel>
                </Field.Root>

                <Field.Root>
                    <Field.HLabel>
                        <Checkbox.Root id="research-seminar" size="lg" />
                        세미나 자료
                    </Field.HLabel>
                </Field.Root>

                <Field.Root>
                    <Field.HLabel>
                        <Checkbox.Root id="research-etc" size="lg" />
                        기타
                    </Field.HLabel>
                </Field.Root>
            </VStack>

            <VStack gap="$100">
                <Text typography="heading5">개인 정보 수신 동의</Text>

                <Field.Root>
                    <HStack width="100%" justifyContent="space-between" render={<Field.HLabel />}>
                        서비스 메일 수신 동의
                        <Switch.Root defaultChecked id="research-service" />
                    </HStack>
                </Field.Root>
                <Field.Root>
                    <HStack width="100%" justifyContent="space-between" render={<Field.HLabel />}>
                        이벤트성 광고 수신 동의
                        <Switch.Root defaultChecked id="research-advertising" />
                    </HStack>
                </Field.Root>
            </VStack>

            <Button size="lg">제출하기</Button>
        </VStack>
    );
}
