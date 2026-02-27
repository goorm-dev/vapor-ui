import type { SubmitEvent } from 'react';
import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircleIcon } from '@vapor-ui/icons';

import { Field } from '.';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Flex } from '../flex';
import { Form } from '../form';
import { Radio } from '../radio';
import { RadioGroup } from '../radio-group';
import { Switch } from '../switch';
import { Text } from '../text';
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

const submitForm = async (event: SubmitEvent<HTMLFormElement>) => {
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
        const [errors] = useState({});

        return (
            <Form
                errors={errors}
                onSubmit={async (event) => {
                    event.preventDefault();

                    const response = await submitForm(event);

                    response.forEach((data) => {
                        console.log(data);
                    });
                }}
            >
                <Flex $css={{ flexDirection: 'column', gap: '$300' }}>
                    <Field.Root
                        name="vapor-policy-agreement"
                        validationMode="onChange"
                        {...fieldArgs}
                    >
                        <Field.Description>non-required checkbox</Field.Description>
                        <Field.Label $css={{ alignItems: 'center' }}>
                            <Checkbox.Root />
                            멘토님 강연 능력
                        </Field.Label>
                        <Field.Error match>좋았던 강의를 최소 하나 이상 선택해주세요</Field.Error>
                        <Field.Success
                            match
                            $css={{ display: 'flex', alignItems: 'center', gap: '$050' }}
                        >
                            <CheckCircleIcon /> 강의 평가가 완료되었습니다
                        </Field.Success>
                    </Field.Root>
                    <Field.Root
                        name="vapor-policy-agreement2"
                        validationMode="onChange"
                        {...fieldArgs}
                    >
                        <Field.Description>required checkbox</Field.Description>

                        <Field.Label $css={{ alignItems: 'center' }}>
                            <Checkbox.Root required />
                            멘토님 강연 능력
                        </Field.Label>
                        <Field.Error match>좋았던 강의를 최소 하나 이상 선택해주세요</Field.Error>
                        <Field.Success match>✓ 강의 평가가 완료되었습니다</Field.Success>
                    </Field.Root>
                    {/* Switch Component Example */}
                    <Field.Root name="notifications" validationMode="onChange" {...fieldArgs}>
                        <Field.Label $css={{ alignItems: 'center' }}>
                            서비스 메일 수신 동의 - required
                            <Switch.Root required />
                        </Field.Label>
                        <Field.Description>
                            서비스 관련 메일과 이벤트 정보를 받아보실 수 있습니다
                        </Field.Description>
                        <Field.Error match>개인 정보 수신 동의가 필요합니다</Field.Error>
                        <Field.Success match>✓ 개인 정보 수신 동의가 완료되었습니다</Field.Success>
                    </Field.Root>
                    <Field.Root name="notifications2" validationMode="onChange" {...fieldArgs}>
                        <Field.Label $css={{ alignItems: 'center' }}>
                            이벤트성 광고 수신 동의 - non required
                            <Switch.Root />
                        </Field.Label>
                        <Field.Description>
                            서비스 관련 메일과 이벤트 정보를 받아보실 수 있습니다
                        </Field.Description>
                        <Field.Error match>개인 정보 수신 동의가 필요합니다</Field.Error>
                        <Field.Success match>✓ 개인 정보 수신 동의가 완료되었습니다</Field.Success>
                    </Field.Root>

                    <Field.Root
                        name="radio-group"
                        render={<RadioGroup.Root required />}
                        {...fieldArgs}
                    >
                        <Field.Label>성별 선택</Field.Label>
                        <Flex $css={{ flexDirection: 'column', gap: '$100' }}>
                            <Field.Item>
                                <Radio.Root value="male" />
                                <Field.Label>남성</Field.Label>
                            </Field.Item>

                            <Field.Item>
                                <Radio.Root value="female" />
                                <Field.Label>여성</Field.Label>
                            </Field.Item>

                            <Field.Item>
                                <Radio.Root value="other" />
                                <Field.Label>기타</Field.Label>
                            </Field.Item>
                        </Flex>
                        <Field.Error match>성별을 반드시 선택해주세요.</Field.Error>
                        <Field.Success match>✓ 성별이 선택되었습니다</Field.Success>
                    </Field.Root>
                    <Field.Root name="email" validationMode="onChange" {...fieldArgs}>
                        <Field.Label
                            render={<Text typography="subtitle2" foreground="normal-200" />}
                        >
                            이름
                        </Field.Label>
                        <TextInput required />
                        <Field.Description>
                            계정 생성을 위해 유효한 이름을 입력해주세요
                        </Field.Description>
                        <Field.Error match="valueMissing">이 필드는 필수입니다.</Field.Error>
                        <Field.Success match>✓ 올바른 이름 형식입니다</Field.Success>
                    </Field.Root>

                    <Button>제출</Button>
                </Flex>
            </Form>
        );
    },
};
