import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Checkbox } from '~/components/checkbox';
import { Field } from '~/components/field';
import { Flex } from '~/components/flex';
import { Radio } from '~/components/radio';
import { RadioGroup } from '~/components/radio-group';
import { Switch } from '~/components/switch';
import { TextInput } from '~/components/text-input';

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

export const TestBed: Story = {
    render: (args) => {
        const { required, ...fieldArgs } = args;
        return (
            <Flex flexDirection="column" gap="$300">
                <Field.Root name="vapor-policy-agreement" validationMode="onChange" {...fieldArgs}>
                    <Flex gap="$100">
                        <Checkbox.Root required={required}>
                            <Checkbox.Indicator>
                                <ConfirmOutlineIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Field.Label>동의합니다.</Field.Label>
                    </Flex>
                    <Field.Description>
                        I agree to the Terms and Conditions and Privacy Policy
                    </Field.Description>
                    <Field.Error>
                        You must agree to the terms and conditions to continue
                    </Field.Error>
                    <Field.Success>
                        ✓ Thank you for accepting our terms and conditions
                    </Field.Success>
                </Field.Root>
                {/* Switch Component Example */}
                <Field.Root name="notifications" validationMode="onChange" {...fieldArgs}>
                    <Flex alignItems="center" gap="$150">
                        <Switch.Root required={required} />
                        <Field.Label>Enable push notifications</Field.Label>
                    </Flex>
                    <Field.Description>
                        Get notified about important updates, security alerts, and account
                        activities
                    </Field.Description>
                    <Field.Error>
                        Please enable notifications to receive important updates
                    </Field.Error>
                    <Field.Success>
                        ✓ Notifications enabled - you'll receive important updates
                    </Field.Success>
                </Field.Root>

                {/* RadioGroup Selection RadioGroup */}
                <Field.Root name="gender" validationMode="onChange" {...fieldArgs}>
                    <Field.Label>성별을 선택하세요</Field.Label>
                    <RadioGroup.Root required={required}>
                        <Field.Description>회원 가입을 위해 성별을 선택해주세요.</Field.Description>
                        <Flex alignItems="center" gap="$150">
                            <Radio.Root value="male" />
                            <Field.Label>남성</Field.Label>
                        </Flex>
                        <Flex alignItems="center" gap="$150">
                            <Radio.Root value="female" />
                            <Field.Label>여성</Field.Label>
                        </Flex>
                        <Flex alignItems="center" gap="$150">
                            <Radio.Root value="other" />
                            <Field.Label>기타</Field.Label>
                        </Flex>
                        {/* Alternatively, you can use Radio.Item for better semantics */}
                        <Field.Error>성별을 반드시 선택해주세요.</Field.Error>
                        <Field.Success>✓ 성별이 선택되었습니다</Field.Success>
                    </RadioGroup.Root>
                </Field.Root>

                {/* TextInput Component Example */}
                <Field.Root name="email" validationMode="onChange" {...fieldArgs}>
                    <Field.Label>이름</Field.Label>
                    <TextInput type="text" placeholder="" required={required} />
                    <Field.Description>
                        계정 생성을 위해 유효한 이름을 입력해주세요
                    </Field.Description>
                    <Field.Error match="valueMissing">이 필드는 필수입니다.</Field.Error>
                    <Field.Success>✓ 올바른 이름 형식입니다</Field.Success>
                </Field.Root>
            </Flex>
        );
    },
};
