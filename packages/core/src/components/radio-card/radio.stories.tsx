import type { StoryObj } from '@storybook/react-vite';

import { RadioCard } from '.';
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
        size: {
            control: 'inline-radio',
            options: ['md', 'lg'],
        },
    },
};

type Story = StoryObj<typeof RadioCard>;

export const Default: Story = {
    render: (args) => <RadioCard {...args}>Item 1</RadioCard>,
};

export const TestBed: Story = {
    render: () => (
        <VStack gap="$200">
            <RadioGroup.Root defaultValue="default">
                <RadioCard value="default">default</RadioCard>
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

            <RadioGroup.Root size="lg" defaultValue="default">
                <RadioCard value="default">default</RadioCard>
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
