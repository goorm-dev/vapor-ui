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
            padding="$300"
            borderRadius="$300"
            width="100%"
            border="1px solid var(--vapor-color-border-normal)"
            render={<Form onSubmit={(event) => event.preventDefault()} />}
        >
            <VStack gap="$200">
                <Text typography="heading5">기본 정보를 입력해주세요.</Text>

                <Field.Root render={<VStack gap="$100" />}>
                    <Field.Label className="input-label">이름 </Field.Label>
                    <TextInput id="research-name" required size="lg" />
                    <Field.Error match="valueMissing">이름을 입력해주세요.</Field.Error>
                </Field.Root>

                <Field.Root render={<VStack gap="$100" />}>
                    <Field.Label className="input-label">직업</Field.Label>
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
                </Field.Root>

                <Field.Root render={<VStack gap="$100" />}>
                    <Field.Label className="input-label">스택</Field.Label>
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
                </Field.Root>
            </VStack>

            <Field.Root render={<VStack gap="$150" />}>
                <RadioGroup.Root>
                    <RadioGroup.Label>만족도를 선택해주세요.</RadioGroup.Label>
                    <HStack
                        render={<Field.Label />}
                        alignItems="center"
                        gap="$100"
                        className="radio-label"
                    >
                        <Radio.Root
                            id="research-fully-satisfied"
                            value="fully-satisfied"
                            size="lg"
                        />
                        매우 만족
                    </HStack>

                    <HStack
                        render={<Field.Label />}
                        alignItems="center"
                        gap="$100"
                        className="radio-label"
                    >
                        <Radio.Root id="research-neutral" value="neutral" size="lg" />
                        매우 만족
                    </HStack>

                    <HStack
                        render={<Field.Label />}
                        alignItems="center"
                        gap="$100"
                        className="radio-label"
                    >
                        <Radio.Root id="research-not-satisfied" value="not-satisfied" size="lg" />
                        불만족
                    </HStack>
                </RadioGroup.Root>
            </Field.Root>

            <VStack gap="$100">
                <VStack marginBottom="$050">
                    <Text typography="heading5">좋았던 강의는 무엇인가요?</Text>
                    <Text typography="body2" foreground="normal-lighter">
                        중복 선택 가능
                    </Text>
                </VStack>

                <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                    <Checkbox.Root id="research-mentoring" size="lg" />
                    <Field.Label className="checkbox-label">멘토님 강연 능력</Field.Label>
                </Field.Root>

                <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                    <Checkbox.Root id="research-topic" size="lg" />
                    <Field.Label className="checkbox-label">
                        주제(협업 및 커뮤니케이션 스킬)
                    </Field.Label>
                </Field.Root>

                <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                    <Checkbox.Root id="research-content" size="lg" />
                    <Field.Label className="checkbox-label">전반적인 강의 내용</Field.Label>
                </Field.Root>

                <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                    <Checkbox.Root id="research-seminar" size="lg" />
                    <Field.Label className="checkbox-label">세미나 자료</Field.Label>
                </Field.Root>

                <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                    <Checkbox.Root id="research-etc" size="lg" />
                    <Field.Label className="checkbox-label">기타</Field.Label>
                </Field.Root>
            </VStack>

            <VStack gap="$100">
                <Text typography="heading5">개인 정보 수신 동의</Text>

                <Field.Root render={<HStack justifyContent="space-between" alignItems="center" />}>
                    <Field.Label className="checkbox-label">서비스 메일 수신 동의</Field.Label>
                    <Switch.Root defaultChecked id="research-service" />
                </Field.Root>
                <Field.Root render={<HStack justifyContent="space-between" alignItems="center" />}>
                    <Field.Label htmlFor="research-advertising" className="checkbox-label">
                        이벤트성 광고 수신 동의
                    </Field.Label>
                    <Switch.Root defaultChecked id="research-advertising" />
                </Field.Root>
            </VStack>

            <Button size="lg">제출하기</Button>
        </VStack>
    );
}
