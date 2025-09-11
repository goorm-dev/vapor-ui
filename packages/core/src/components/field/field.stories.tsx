import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Checkbox } from '~/components/checkbox';
import { Flex } from '~/components/flex';
import { RadioGroup } from '~/components/radio-group';
import { Switch } from '~/components/switch';

import { Field } from './field';

const meta: Meta<typeof Field.Root> = {
    title: 'Field',
    component: Field.Root,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Field.Root>;

export const TestBed: Story = {
    render: () => {
        return (
            <Flex flexDirection="column" gap="$300">
                <Field.Root name="vapor-policy-agreement" validationMode="onChange">
                    <Checkbox.Root required>
                        <Checkbox.Control>
                            <ConfirmOutlineIcon />
                        </Checkbox.Control>
                        <Field.Label>동의합니다.</Field.Label>
                    </Checkbox.Root>
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
                <Field.Root name="notifications" validationMode="onChange">
                    <Switch.Root required>
                        <Flex alignItems="center" gap="$150">
                            <Switch.Control />
                            <Field.Label>Enable push notifications</Field.Label>
                        </Flex>
                    </Switch.Root>
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
                <Field.Root name="gender" validationMode="onChange">
                    <Field.Label>성별을 선택하세요</Field.Label>
                    <Field.Description>회원 가입을 위해 성별을 선택해주세요.</Field.Description>
                    <RadioGroup.Root required>
                        <RadioGroup.Item value="male">
                            <Flex alignItems="center" gap="$150">
                                <RadioGroup.Control />
                                <RadioGroup.Label>남성</RadioGroup.Label>
                            </Flex>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="female">
                            <Flex alignItems="center" gap="$150">
                                <RadioGroup.Control />
                                <RadioGroup.Label>여성</RadioGroup.Label>
                            </Flex>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="other">
                            <Flex alignItems="center" gap="$150">
                                <RadioGroup.Control />
                                <RadioGroup.Label>기타</RadioGroup.Label>
                            </Flex>
                        </RadioGroup.Item>
                    </RadioGroup.Root>
                    <Field.Error>성별을 반드시 선택해주세요.</Field.Error>
                    <Field.Success>✓ 성별이 선택되었습니다</Field.Success>
                </Field.Root>
            </Flex>
        );
    },
};
