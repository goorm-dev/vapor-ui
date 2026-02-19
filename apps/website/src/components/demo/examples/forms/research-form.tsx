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
            render={<Form onSubmit={(event) => event.preventDefault()} />}
            $css={{
                gap: '$500',
                padding: '$300',
                borderRadius: '$300',
                width: '100%',
                border: '1px solid var(--vapor-color-border-normal)',
            }}
        >
            <VStack $css={{ gap: '$200' }}>
                <Text typography="heading5">기본 정보를 입력해주세요.</Text>

                <Field.Root>
                    <Field.Label $css={{ flexDirection: 'column' }}>
                        <Text typography="subtitle2" foreground="normal-200">
                            이름
                        </Text>
                        <TextInput id="research-name" required size="lg" />
                    </Field.Label>
                    <Field.Error match="valueMissing">이름을 입력해주세요.</Field.Error>
                </Field.Root>

                <Field.Root>
                    <Field.Label htmlFor="research-jobs" $css={{ flexDirection: 'column' }}>
                        <Text typography="subtitle2" foreground="normal-200">
                            직업
                        </Text>
                        <Select.Root items={jobs} placeholder="직업을 선택해주세요." size="lg">
                            <Select.Trigger id="research-jobs" />
                            <Select.Popup>
                                {jobs.map((job) => (
                                    <Select.Item key={job.value} value={job.value}>
                                        {job.label}
                                    </Select.Item>
                                ))}
                            </Select.Popup>
                        </Select.Root>
                    </Field.Label>
                </Field.Root>

                <Field.Root>
                    <Field.Label htmlFor="research-stack" $css={{ flexDirection: 'column' }}>
                        <Text typography="subtitle2" foreground="normal-200">
                            스택
                        </Text>
                        <MultiSelect.Root
                            items={stacks}
                            placeholder="자주 사용하는 스택을 선택해주세요."
                            size="lg"
                        >
                            <MultiSelect.Trigger id="research-stack" />
                            <MultiSelect.Popup>
                                {stacks.map((stack) => (
                                    <MultiSelect.Item key={stack.value} value={stack.value}>
                                        {stack.label}
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Popup>
                        </MultiSelect.Root>
                    </Field.Label>
                </Field.Root>
            </VStack>

            <Field.Root>
                <RadioGroup.Root>
                    <RadioGroup.Label>만족도를 선택해주세요.</RadioGroup.Label>
                    <VStack $css={{ gap: '$100' }}>
                        <Field.Item>
                            <Radio.Root
                                id="research-fully-satisfied"
                                value="fully-satisfied"
                                size="lg"
                            />
                            <Field.Label>매우 만족</Field.Label>
                        </Field.Item>

                        <Field.Item>
                            <Radio.Root id="research-neutral" value="neutral" size="lg" />
                            <Field.Label>보통</Field.Label>
                        </Field.Item>

                        <Field.Item>
                            <Radio.Root
                                id="research-not-satisfied"
                                value="not-satisfied"
                                size="lg"
                            />
                            <Field.Label>불만족</Field.Label>
                        </Field.Item>
                    </VStack>
                </RadioGroup.Root>
            </Field.Root>

            <VStack $css={{ gap: '$100' }}>
                <VStack $css={{ marginBottom: '$050' }}>
                    <Text typography="heading5">좋았던 강의는 무엇인가요?</Text>
                    <Text typography="body2" foreground="normal-100">
                        중복 선택 가능
                    </Text>
                </VStack>

                <Field.Root>
                    <Field.Item>
                        <Checkbox.Root id="research-mentoring" size="lg" />
                        <Field.Label>멘토님 강연 능력</Field.Label>
                    </Field.Item>
                </Field.Root>

                <Field.Root>
                    <Field.Item>
                        <Checkbox.Root id="research-topic" size="lg" />
                        <Field.Label>주제(협업 및 커뮤니케이션 스킬)</Field.Label>
                    </Field.Item>
                </Field.Root>

                <Field.Root>
                    <Field.Item>
                        <Checkbox.Root id="research-content" size="lg" />
                        <Field.Label>전반적인 강의 내용</Field.Label>
                    </Field.Item>
                </Field.Root>

                <Field.Root>
                    <Field.Item>
                        <Checkbox.Root id="research-seminar" size="lg" />
                        <Field.Label>세미나 자료</Field.Label>
                    </Field.Item>
                </Field.Root>

                <Field.Root>
                    <Field.Item>
                        <Checkbox.Root id="research-etc" size="lg" />
                        <Field.Label>기타</Field.Label>
                    </Field.Item>
                </Field.Root>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <Text typography="heading5">개인 정보 수신 동의</Text>

                <Field.Root>
                    <Field.Label
                        render={
                            <HStack $css={{ width: '100%', justifyContent: 'space-between' }} />
                        }
                    >
                        서비스 메일 수신 동의
                        <Switch.Root defaultChecked id="research-service" />
                    </Field.Label>
                </Field.Root>
                <Field.Root>
                    <Field.Label
                        render={
                            <HStack $css={{ width: '100%', justifyContent: 'space-between' }} />
                        }
                    >
                        이벤트성 광고 수신 동의
                        <Switch.Root defaultChecked id="research-advertising" />
                    </Field.Label>
                </Field.Root>
            </VStack>

            <Button size="lg">제출하기</Button>
        </VStack>
    );
}
