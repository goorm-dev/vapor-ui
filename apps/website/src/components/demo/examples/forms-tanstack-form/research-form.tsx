import './research-form.css';

import { useForm } from '@tanstack/react-form';
import {
    Box,
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
    const form = useForm({
        defaultValues: {
            name: '',
            job: '',
            stack: [] as string[],
            satisfaction: '',
            mentoring: false,
            topic: false,
            content: false,
            seminar: false,
            etc: false,
            serviceMail: true,
            advertising: true,
        },
        onSubmit: async ({ value }) => {
            console.log('Form submitted:', value);
        },
    });

    return (
        <VStack
            gap="$500"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
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
            <VStack gap="$200">
                <Text typography="heading5">기본 정보를 입력해주세요.</Text>

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
                            <Box render={<Field.Label />} flexDirection="column">
                                <Text typography="subtitle2" foreground="normal-200">
                                    이름
                                </Text>
                                <TextInput
                                    id="research-name"
                                    size="lg"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                />
                            </Box>
                            {field.state.meta.errors.length > 0 && (
                                <Field.Error match>{field.state.meta.errors[0]}</Field.Error>
                            )}
                        </Field.Root>
                    )}
                </form.Field>

                <form.Field name="job">
                    {(field) => (
                        <Field.Root>
                            <Box
                                render={<Field.Label htmlFor="research-jobs" />}
                                flexDirection="column"
                            >
                                <Text typography="subtitle2" foreground="normal-200">
                                    직업
                                </Text>
                                <Select.Root
                                    items={jobs}
                                    placeholder="직업을 선택해주세요."
                                    size="lg"
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value as string)}
                                >
                                    <Select.Trigger id="research-jobs" />
                                    <Select.Popup>
                                        {jobs.map((job) => (
                                            <Select.Item key={job.value} value={job.value}>
                                                {job.label}
                                            </Select.Item>
                                        ))}
                                    </Select.Popup>
                                </Select.Root>
                            </Box>
                        </Field.Root>
                    )}
                </form.Field>

                <form.Field name="stack">
                    {(field) => (
                        <Field.Root>
                            <Box
                                render={<Field.Label htmlFor="research-stack" />}
                                flexDirection="column"
                            >
                                <Text typography="subtitle2" foreground="normal-200">
                                    스택
                                </Text>
                                <MultiSelect.Root
                                    items={stacks}
                                    placeholder="자주 사용하는 스택을 선택해주세요."
                                    size="lg"
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value as string[])}
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
                            </Box>
                        </Field.Root>
                    )}
                </form.Field>
            </VStack>

            <form.Field name="satisfaction">
                {(field) => (
                    <Field.Root>
                        <RadioGroup.Root
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value as string)}
                        >
                            <RadioGroup.Label>만족도를 선택해주세요.</RadioGroup.Label>
                            <Box render={<Field.Label />} alignItems="center">
                                <Radio.Root
                                    id="research-fully-satisfied"
                                    value="fully-satisfied"
                                    size="lg"
                                />
                                매우 만족
                            </Box>

                            <Box render={<Field.Label />} alignItems="center">
                                <Radio.Root id="research-neutral" value="neutral" size="lg" />
                                보통
                            </Box>

                            <Box render={<Field.Label />} alignItems="center">
                                <Radio.Root
                                    id="research-not-satisfied"
                                    value="not-satisfied"
                                    size="lg"
                                />
                                불만족
                            </Box>
                        </RadioGroup.Root>
                    </Field.Root>
                )}
            </form.Field>

            <VStack gap="$100">
                <VStack marginBottom="$050">
                    <Text typography="heading5">좋았던 강의는 무엇인가요?</Text>
                    <Text typography="body2" foreground="normal-100">
                        중복 선택 가능
                    </Text>
                </VStack>

                <form.Field name="mentoring">
                    {(field) => (
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Checkbox.Root
                                    id="research-mentoring"
                                    size="lg"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                        field.handleChange(checked === true)
                                    }
                                />
                                멘토님 강연 능력
                            </Box>
                        </Field.Root>
                    )}
                </form.Field>

                <form.Field name="topic">
                    {(field) => (
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Checkbox.Root
                                    id="research-topic"
                                    size="lg"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                        field.handleChange(checked === true)
                                    }
                                />
                                주제(협업 및 커뮤니케이션 스킬)
                            </Box>
                        </Field.Root>
                    )}
                </form.Field>

                <form.Field name="content">
                    {(field) => (
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Checkbox.Root
                                    id="research-content"
                                    size="lg"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                        field.handleChange(checked === true)
                                    }
                                />
                                전반적인 강의 내용
                            </Box>
                        </Field.Root>
                    )}
                </form.Field>

                <form.Field name="seminar">
                    {(field) => (
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Checkbox.Root
                                    id="research-seminar"
                                    size="lg"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                        field.handleChange(checked === true)
                                    }
                                />
                                세미나 자료
                            </Box>
                        </Field.Root>
                    )}
                </form.Field>

                <form.Field name="etc">
                    {(field) => (
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Checkbox.Root
                                    id="research-etc"
                                    size="lg"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                        field.handleChange(checked === true)
                                    }
                                />
                                기타
                            </Box>
                        </Field.Root>
                    )}
                </form.Field>
            </VStack>

            <VStack gap="$100">
                <Text typography="heading5">개인 정보 수신 동의</Text>

                <form.Field name="serviceMail">
                    {(field) => (
                        <Field.Root>
                            <HStack
                                width="100%"
                                justifyContent="space-between"
                                render={<Field.Label />}
                            >
                                서비스 메일 수신 동의
                                <Switch.Root
                                    id="research-service"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                        field.handleChange(checked === true)
                                    }
                                />
                            </HStack>
                        </Field.Root>
                    )}
                </form.Field>
                <form.Field name="advertising">
                    {(field) => (
                        <Field.Root>
                            <HStack
                                width="100%"
                                justifyContent="space-between"
                                render={<Field.Label />}
                            >
                                이벤트성 광고 수신 동의
                                <Switch.Root
                                    id="research-advertising"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                        field.handleChange(checked === true)
                                    }
                                />
                            </HStack>
                        </Field.Root>
                    )}
                </form.Field>
            </VStack>

            <Button type="submit" size="lg">
                제출하기
            </Button>
        </VStack>
    );
}
