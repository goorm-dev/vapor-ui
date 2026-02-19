import type { StoryObj } from '@storybook/react-vite';

import { RadioCard } from '.';
import { Flex } from '../flex';
import { RadioGroup } from '../radio-group';
import { VStack } from '../v-stack';

export default {
    title: 'RadioCard',
    component: RadioCard,
    argTypes: {
        disabled: { control: 'boolean' },
        invalid: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        required: { control: 'boolean' },
    },
};

type Story = StoryObj<typeof RadioCard>;

export const Default: Story = {
    render: (args) => <RadioCard {...args}>Item 1</RadioCard>,
};

export const Checked: Story = {
    render: (args) => (
        <Flex>
            <RadioGroup.Root defaultValue="1" name="radio-card-group">
                <RadioCard {...args} value="1">
                    Item 1
                </RadioCard>
            </RadioGroup.Root>
        </Flex>
    ),
};

export const TestBed: Story = {
    render: () => (
        <VStack $css={{ gap: '$400' }}>
            <RadioGroup.Root defaultValue="checked" name="radio-card-group">
                <RadioCard value="default">default</RadioCard>
                <RadioCard value="checked">checked</RadioCard>
                <RadioCard invalid value="invalid">
                    invalid
                </RadioCard>
                <RadioCard disabled value="disabled">
                    disabled
                </RadioCard>
                <RadioCard required value="required">
                    required
                </RadioCard>
                <RadioCard readOnly value="readOnly">
                    readOnly
                </RadioCard>
            </RadioGroup.Root>

            <RadioGroup.Root defaultValue="checked" name="radio-card-group">
                <RadioCard value="default">default</RadioCard>
                <RadioCard value="checked">checked</RadioCard>
                <RadioCard invalid value="invalid">
                    invalid
                </RadioCard>
                <RadioCard disabled value="disabled">
                    disabled
                </RadioCard>
                <RadioCard required value="required">
                    required
                </RadioCard>
                <RadioCard readOnly value="readOnly">
                    readOnly
                </RadioCard>
            </RadioGroup.Root>
        </VStack>
    ),
};
