import type { FormEvent } from 'react';
import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircleIcon } from '@vapor-ui/icons';

import { Field } from '.';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Flex } from '../flex';
import { Form } from '../form';
import { HStack } from '../h-stack';
import { Radio } from '../radio';
import { RadioGroup } from '../radio-group';
import { Switch } from '../switch';
import { TextInput } from '../text-input';

type FieldStoryArgs = React.ComponentProps<typeof Field.Root> & {
    required?: boolean;
};

const meta: Meta<FieldStoryArgs> = {
    title: 'Field',
    component: Field.Root,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        disabled: {
            control: 'boolean',
            description: 'Whether the field is disabled',
        },
        required: {
            control: 'boolean',
            description: 'Whether the inner form controls are required',
        },
    },
};

export default meta;
type Story = StoryObj<FieldStoryArgs>;

const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);

    const datas = formData.keys().reduce<[string, FormDataEntryValue | boolean][]>((acc, key) => {
        const value = formData.get(key);

        if (value === null || value === '') return acc;

        return [...acc, [key, value === 'on' ? true : value]];
    }, []);

    return datas;
};

export const TestBed: Story = {
    render: (args) => {
        const { required, ...fieldArgs } = args;
        const [errors, setErrors] = useState({});

        return (
            <Form
                errors={errors}
                onClearErrors={setErrors}
                onSubmit={async (event) => {
                    event.preventDefault();

                    const response = await submitForm(event);

                    response.forEach((data) => {
                        console.log(data);
                    });
                }}
            >
                <Flex flexDirection="column" gap="$300">
                    <Field.Root
                        name="vapor-policy-agreement"
                        validationMode="onChange"
                        {...fieldArgs}
                    >
                        <Field.Description>non-required checkbox</Field.Description>
                        <HStack gap="$100" alignItems="center">
                            <Checkbox.Root />
                            <Field.Label>멘토님 강연 능력</Field.Label>
                        </HStack>
                        <Field.Error match>좋았던 강의를 최소 하나 이상 선택해주세요</Field.Error>
                        {/* @ts-ignore */}
                        <Field.Success match>
                            <CheckCircleIcon /> 강의 평가가 완료되었습니다
                        </Field.Success>
                    </Field.Root>
                    <Field.Root
                        name="vapor-policy-agreement2"
                        validationMode="onChange"
                        {...fieldArgs}
                    >
                        <Field.Description>required checkbox</Field.Description>
                        <HStack gap="$100" alignItems="center">
                            <Checkbox.Root required />
                            <Field.Label>멘토님 강연 능력</Field.Label>
                        </HStack>
                        <Field.Error match>좋았던 강의를 최소 하나 이상 선택해주세요</Field.Error>
                        {/* @ts-ignore */}
                        <Field.Success match>✓ 강의 평가가 완료되었습니다</Field.Success>
                    </Field.Root>
                    {/* Switch Component Example */}
                    <Field.Root name="notifications" validationMode="onChange" {...fieldArgs}>
                        <HStack gap="$100" alignItems="center" justifyContent="space-between">
                            <Field.Label>서비스 메일 수신 동의 - required</Field.Label>
                            <Switch.Root required />
                        </HStack>
                        <Field.Description>
                            서비스 관련 메일과 이벤트 정보를 받아보실 수 있습니다
                        </Field.Description>
                        <Field.Error match>개인 정보 수신 동의가 필요합니다</Field.Error>
                        {/* @ts-ignore */}
                        <Field.Success match>✓ 개인 정보 수신 동의가 완료되었습니다</Field.Success>
                    </Field.Root>
                    <Field.Root name="notifications2" validationMode="onChange" {...fieldArgs}>
                        <HStack alignItems="center" gap="$100" justifyContent="space-between">
                            <Field.Label>이벤트성 광고 수신 동의 - non required</Field.Label>
                            <Switch.Root />
                        </HStack>
                        <Field.Description>
                            서비스 관련 메일과 이벤트 정보를 받아보실 수 있습니다
                        </Field.Description>
                        <Field.Error match>개인 정보 수신 동의가 필요합니다</Field.Error>
                        {/* @ts-ignore */}
                        <Field.Success match>✓ 개인 정보 수신 동의가 완료되었습니다</Field.Success>
                    </Field.Root>

                    <Field.Root
                        name="radio-group"
                        render={<RadioGroup.Root required />}
                        {...fieldArgs}
                    >
                        <HStack alignItems="center" gap="$100" render={<Field.Label />}>
                            <Radio.Root value="male" />
                            남성
                        </HStack>

                        <HStack alignItems="center" gap="$100" render={<Field.Label />}>
                            <Radio.Root value="female" />
                            여성
                        </HStack>

                        <HStack alignItems="center" gap="$100" render={<Field.Label />}>
                            <Radio.Root value="other" />
                            기타
                        </HStack>
                        <Field.Error match>성별을 반드시 선택해주세요.</Field.Error>
                        {/* @ts-ignore */}
                        <Field.Success match>✓ 성별이 선택되었습니다</Field.Success>
                    </Field.Root>
                    <Field.Root name="email" validationMode="onChange" {...fieldArgs}>
                        <Field.Label>이름</Field.Label>
                        <TextInput required />
                        <Field.Description>
                            계정 생성을 위해 유효한 이름을 입력해주세요
                        </Field.Description>
                        <Field.Error match="valueMissing">이 필드는 필수입니다.</Field.Error>
                        {/* @ts-ignore */}
                        <Field.Success match>✓ 올바른 이름 형식입니다</Field.Success>
                    </Field.Root>

                    <Button>제출</Button>
                </Flex>
            </Form>
        );
    },
};
