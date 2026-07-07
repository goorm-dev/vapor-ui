import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeartIcon } from '@vapor-ui/icons';

import { HStack } from '../h-stack';
import { VStack } from '../v-stack';
import { Toggle } from './toggle';

type StoryMeta = Meta<typeof Toggle>;

export default {
    title: 'Toggle',
    component: Toggle,
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
        variant: {
            control: { type: 'inline-radio' },
            options: ['default', 'accent'],
        },
    },
} satisfies StoryMeta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
    render: (args) => {
        return (
            <Toggle {...args}>
                <HeartIcon />
            </Toggle>
        );
    },
};

export const TestBed: Story = {
    render: (args) => {
        return (
            <VStack $css={{ gap: '$100' }}>
                {renderCases(args)}
                {renderCases({ ...args, disabled: true })}
                {renderCases({ ...args, variant: 'accent' })}
                {renderCases({ ...args, variant: 'accent', disabled: true })}
                {renderCases({ ...args, pressed: true })}
                {renderCases({ ...args, pressed: true, disabled: true })}
                {renderCases({ ...args, pressed: true, variant: 'accent' })}
                {renderCases({ ...args, pressed: true, variant: 'accent', disabled: true })}
            </VStack>
        );
    },
};

const renderCases = ({ variant, disabled, pressed }: Toggle.Props) => {
    return (
        <HStack $css={{ gap: '$100' }}>
            <Toggle size="sm" variant={variant} disabled={disabled} pressed={pressed}>
                <HeartIcon />
            </Toggle>
            <Toggle size="md" variant={variant} disabled={disabled} pressed={pressed}>
                <HeartIcon />
            </Toggle>
            <Toggle size="lg" variant={variant} disabled={disabled} pressed={pressed}>
                <HeartIcon />
            </Toggle>
            <Toggle size="xl" variant={variant} disabled={disabled} pressed={pressed}>
                <HeartIcon />
            </Toggle>
        </HStack>
    );
};
