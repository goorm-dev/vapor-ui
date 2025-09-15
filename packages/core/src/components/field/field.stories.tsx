import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Checkbox } from '~/components/checkbox';
import { Field } from '~/components/field';
import { Flex } from '~/components/flex';
import { Radio } from '~/components/radio';
import { RadioGroup } from '~/components/radio-group';
import { Switch } from '~/components/switch';
import { TextInput } from '~/components/text-input';

import { Text } from '../text';

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
                    <Text typography="heading5" render={<legend />}>
                        좋았던 강의는 무엇인가요?
                    </Text>
                    <Field.Description>중복 선택 가능</Field.Description>
                    <Flex gap="$100">
                        <Checkbox.Root required={required}>
                            <Checkbox.Indicator>
                                <ConfirmOutlineIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Field.Label>멘토님 강연 능력</Field.Label>
                    </Flex>
                    <Flex gap="$100">
                        <Checkbox.Root required={required}>
                            <Checkbox.Indicator>
                                <ConfirmOutlineIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Field.Label>주제(협업 및 커뮤니케이션 스킬)</Field.Label>
                    </Flex>
                    <Flex gap="$100">
                        <Checkbox.Root required={required}>
                            <Checkbox.Indicator>
                                <ConfirmOutlineIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Field.Label>전반적인 강의 내용</Field.Label>
                    </Flex>
                    <Flex gap="$100">
                        <Checkbox.Root required={required}>
                            <Checkbox.Indicator>
                                <ConfirmOutlineIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Field.Label>세미나 자료</Field.Label>
                    </Flex>
                    <Flex gap="$100">
                        <Checkbox.Root required={required}>
                            <Checkbox.Indicator>
                                <ConfirmOutlineIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Field.Label>기타</Field.Label>
                    </Flex>
                    <Field.Error>좋았던 강의를 최소 하나 이상 선택해주세요</Field.Error>
                    <Field.Success>✓ 강의 평가가 완료되었습니다</Field.Success>
                </Field.Root>
                {/* Switch Component Example */}
                <Field.Root name="notifications" validationMode="onChange" {...fieldArgs}>
                    <Text typography="heading5" render={<legend />}>
                        개인 정보 수신 동의
                    </Text>
                    <Flex alignItems="center" gap="$100" justifyContent="space-between">
                        <Field.Label>서비스 메일 수신 동의</Field.Label>
                        <Switch.Root required={required} />
                    </Flex>
                    <Flex alignItems="center" gap="$100" justifyContent="space-between">
                        <Field.Label>이벤트성 광고 수신 동의</Field.Label>
                        <Switch.Root required={required} />
                    </Flex>
                    <Field.Description>
                        서비스 관련 메일과 이벤트 정보를 받아보실 수 있습니다
                    </Field.Description>
                    <Field.Error>개인 정보 수신 동의가 필요합니다</Field.Error>
                    <Field.Success>✓ 개인 정보 수신 동의가 완료되었습니다</Field.Success>
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
