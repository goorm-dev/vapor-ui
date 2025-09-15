import { Fieldset } from '@base-ui-components/react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Checkbox } from '~/components/checkbox';
import { Field } from '~/components/field';
import { Flex } from '~/components/flex';
import { Radio } from '~/components/radio';
import { RadioGroup } from '~/components/radio-group';
import { Switch } from '~/components/switch';

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

export const TestBed: Story = {
    render: (args) => {
        const { required, ...fieldArgs } = args;
        return (
            <Flex flexDirection="column" gap="$300">
                <Field.Root name="vapor-policy-agreement" validationMode="onChange" {...fieldArgs}>
                    <Field.Description>non-required checkbox</Field.Description>
                    <Flex gap="$100">
                        <Checkbox.Root required={required}>
                            <Checkbox.Indicator>
                                <ConfirmOutlineIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Field.Label>멘토님 강연 능력</Field.Label>
                    </Flex>
                    <Field.Error>좋았던 강의를 최소 하나 이상 선택해주세요</Field.Error>
                    <Field.Success>✓ 강의 평가가 완료되었습니다</Field.Success>
                </Field.Root>
                <Field.Root name="vapor-policy-agreement" validationMode="onChange">
                    <Field.Description>required checkbox</Field.Description>
                    <Flex gap="$100">
                        <Checkbox.Root required>
                            <Checkbox.Indicator>
                                <ConfirmOutlineIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Field.Label>멘토님 강연 능력</Field.Label>
                    </Flex>
                    <Field.Error>좋았던 강의를 최소 하나 이상 선택해주세요</Field.Error>
                    <Field.Success>✓ 강의 평가가 완료되었습니다</Field.Success>
                </Field.Root>
                {/* Switch Component Example */}
                <Field.Root name="notifications" validationMode="onChange" {...fieldArgs}>
                    <Flex alignItems="center" gap="$100" justifyContent="space-between">
                        <Field.Label>서비스 메일 수신 동의 - required</Field.Label>
                        <Switch.Root required />
                    </Flex>
                    <Field.Description>
                        서비스 관련 메일과 이벤트 정보를 받아보실 수 있습니다
                    </Field.Description>
                    <Field.Error>개인 정보 수신 동의가 필요합니다</Field.Error>
                    <Field.Success>✓ 개인 정보 수신 동의가 완료되었습니다</Field.Success>
                </Field.Root>
                <Field.Root name="notifications" validationMode="onChange" {...fieldArgs}>
                    <Flex alignItems="center" gap="$100" justifyContent="space-between">
                        <Field.Label>이벤트성 광고 수신 동의 - non required</Field.Label>
                        <Switch.Root />
                    </Flex>
                    <Field.Description>
                        서비스 관련 메일과 이벤트 정보를 받아보실 수 있습니다
                    </Field.Description>
                    <Field.Error>개인 정보 수신 동의가 필요합니다</Field.Error>
                    <Field.Success>✓ 개인 정보 수신 동의가 완료되었습니다</Field.Success>
                </Field.Root>

                {/* RadioGroup Selection RadioGroup */}
                <Field.Root name="radio-group" render={<Fieldset.Root />} validationMode="onChange">
                    <RadioGroup.Root required>
                        <Field.Label>
                            <Radio.Root value="male">
                                <Radio.Indicator />
                            </Radio.Root>
                            남성
                        </Field.Label>
                        <Field.Label>
                            <Radio.Root value="female">
                                <Radio.Indicator />
                            </Radio.Root>
                            여성
                        </Field.Label>
                        <Field.Label>
                            <Radio.Root value="other">
                                <Radio.Indicator />
                            </Radio.Root>
                            기타
                        </Field.Label>
                    </RadioGroup.Root>
                    <Field.Error>성별을 반드시 선택해주세요.</Field.Error>
                    <Field.Success>✓ 성별이 선택되었습니다</Field.Success>
                </Field.Root>
                <Field.Root name="email" validationMode="onChange">
                    <Field.Label>이름</Field.Label>
                    <TextInput type="text" placeholder="" required />
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
