import './research-form.css';

import { Controller, useForm } from 'react-hook-form';

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

interface ResearchFormData {
    name: string;
    job: string;
    stack: string[];
    satisfaction: string;
    mentoring: boolean;
    topic: boolean;
    content: boolean;
    seminar: boolean;
    etc: boolean;
    serviceMail: boolean;
    advertising: boolean;
}

export default function ResearchForm() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ResearchFormData>({
        defaultValues: {
            name: '',
            job: '',
            stack: [],
            satisfaction: '',
            mentoring: false,
            topic: false,
            content: false,
            seminar: false,
            etc: false,
            serviceMail: true,
            advertising: true,
        },
    });

    const onSubmit = (data: ResearchFormData) => {
        console.log('Research form submitted:', data);
    };

    return (
        <VStack
            gap="$500"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            render={<Form onSubmit={handleSubmit(onSubmit)} />}
        >
            <VStack gap="$200">
                <Text typography="heading5">기본 정보를 입력해주세요.</Text>

                <Field.Root invalid={!!errors.name}>
                    <Box render={<Field.Label />} flexDirection="column">
                        <Text typography="subtitle2" foreground="normal-200">
                            이름
                        </Text>
                        <TextInput
                            id="research-name"
                            size="lg"
                            {...register('name', {
                                required: '이름을 입력해주세요.',
                            })}
                        />
                    </Box>
                    {errors.name && <Field.Error>{errors.name.message}</Field.Error>}
                </Field.Root>

                <Field.Root>
                    <Box render={<Field.Label htmlFor="research-jobs" />} flexDirection="column">
                        <Text typography="subtitle2" foreground="normal-200">
                            직업
                        </Text>
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
                                    <Select.Trigger id="research-jobs" />
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
                    </Box>
                </Field.Root>

                <Field.Root>
                    <Box render={<Field.Label htmlFor="research-stack" />} flexDirection="column">
                        <Text typography="subtitle2" foreground="normal-200">
                            스택
                        </Text>
                        <Controller
                            name="stack"
                            control={control}
                            render={({ field }) => (
                                <MultiSelect.Root
                                    items={stacks}
                                    placeholder="자주 사용하는 스택을 선택해주세요."
                                    size="lg"
                                    value={field.value}
                                    onValueChange={field.onChange}
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
                            )}
                        />
                    </Box>
                </Field.Root>
            </VStack>

            <Field.Root>
                <Controller
                    name="satisfaction"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
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
                    )}
                />
            </Field.Root>

            <VStack gap="$100">
                <VStack marginBottom="$050">
                    <Text typography="heading5">좋았던 강의는 무엇인가요?</Text>
                    <Text typography="body2" foreground="normal-100">
                        중복 선택 가능
                    </Text>
                </VStack>

                <Field.Root>
                    <Box render={<Field.Label />} alignItems="center">
                        <Controller
                            name="mentoring"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Root
                                    id="research-mentoring"
                                    size="lg"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        멘토님 강연 능력
                    </Box>
                </Field.Root>

                <Field.Root>
                    <Box render={<Field.Label />} alignItems="center">
                        <Controller
                            name="topic"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Root
                                    id="research-topic"
                                    size="lg"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        주제(협업 및 커뮤니케이션 스킬)
                    </Box>
                </Field.Root>

                <Field.Root>
                    <Box render={<Field.Label />} alignItems="center">
                        <Controller
                            name="content"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Root
                                    id="research-content"
                                    size="lg"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        전반적인 강의 내용
                    </Box>
                </Field.Root>

                <Field.Root>
                    <Box render={<Field.Label />} alignItems="center">
                        <Controller
                            name="seminar"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Root
                                    id="research-seminar"
                                    size="lg"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        세미나 자료
                    </Box>
                </Field.Root>

                <Field.Root>
                    <Box render={<Field.Label />} alignItems="center">
                        <Controller
                            name="etc"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Root
                                    id="research-etc"
                                    size="lg"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        기타
                    </Box>
                </Field.Root>
            </VStack>

            <VStack gap="$100">
                <Text typography="heading5">개인 정보 수신 동의</Text>

                <Field.Root>
                    <HStack width="100%" justifyContent="space-between" render={<Field.Label />}>
                        서비스 메일 수신 동의
                        <Controller
                            name="serviceMail"
                            control={control}
                            render={({ field }) => (
                                <Switch.Root
                                    id="research-service"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </HStack>
                </Field.Root>
                <Field.Root>
                    <HStack width="100%" justifyContent="space-between" render={<Field.Label />}>
                        이벤트성 광고 수신 동의
                        <Controller
                            name="advertising"
                            control={control}
                            render={({ field }) => (
                                <Switch.Root
                                    id="research-advertising"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </HStack>
                </Field.Root>
            </VStack>

            <Button type="submit" size="lg">
                제출하기
            </Button>
        </VStack>
    );
}
