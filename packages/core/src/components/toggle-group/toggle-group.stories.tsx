import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeartIcon } from '@vapor-ui/icons';

import { ToggleGroup } from '.';
import { Grid } from '../grid';
import { Toggle } from '../toggle';
import { VStack } from '../v-stack';

export default {
    title: 'ToggleGroup',
    component: ToggleGroup.Root,
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
        variant: {
            control: { type: 'inline-radio' },
            options: ['default', 'accent'],
        },
        disabled: {
            control: { type: 'boolean' },
        },
    },
} satisfies Meta<typeof ToggleGroup.Root>;

type Story = StoryObj<typeof ToggleGroup.Root>;

export const Default: Story = {
    render: (args) => {
        return (
            <ToggleGroup.Root {...args}>
                <Toggle value="item1">
                    <HeartIcon />
                </Toggle>
                <Toggle value="item2">
                    <HeartIcon />
                </Toggle>
                <Toggle value="item3">
                    <HeartIcon />
                </Toggle>

                <ToggleGroup.Separator />

                <Toggle value="item4">
                    <HeartIcon />
                </Toggle>
                <Toggle value="item5">
                    <HeartIcon />
                </Toggle>
                <Toggle value="item6">
                    <HeartIcon />
                </Toggle>
            </ToggleGroup.Root>
        );
    },
};

export const TestBed: Story = {
    render: (args) => {
        return (
            <Grid.Root templateColumns="repeat(4, 1fr)" templateRows="auto" $css={{ gap: '$100' }}>
                <Grid.Item>
                    <VStack $css={{ gap: '$100', alignItems: 'flex-start' }}>
                        {renderCases({ size: 'sm' })}
                        {renderCases({ size: 'md' })}
                        {renderCases({ size: 'lg' })}
                        {renderCases({ size: 'xl' })}
                    </VStack>
                </Grid.Item>

                <Grid.Item>
                    <VStack $css={{ gap: '$100', alignItems: 'flex-start' }}>
                        {renderCases({ size: 'sm', disabled: true })}
                        {renderCases({ size: 'md', disabled: true })}
                        {renderCases({ size: 'lg', disabled: true })}
                        {renderCases({ size: 'xl', disabled: true })}
                    </VStack>
                </Grid.Item>

                <Grid.Item>
                    <VStack $css={{ gap: '$100', alignItems: 'flex-start' }}>
                        {renderCases({ variant: 'accent', size: 'sm' })}
                        {renderCases({ variant: 'accent', size: 'md' })}
                        {renderCases({ variant: 'accent', size: 'lg' })}
                        {renderCases({ variant: 'accent', size: 'xl' })}
                    </VStack>
                </Grid.Item>

                <Grid.Item>
                    <VStack $css={{ gap: '$100', alignItems: 'flex-start' }}>
                        {renderCases({ variant: 'accent', size: 'sm', disabled: true })}
                        {renderCases({ variant: 'accent', size: 'md', disabled: true })}
                        {renderCases({ variant: 'accent', size: 'lg', disabled: true })}
                        {renderCases({ variant: 'accent', size: 'xl', disabled: true })}
                    </VStack>
                </Grid.Item>

                <ToggleGroup.Root {...args} value={['item3', 'item4']}>
                    <Toggle value="item1">
                        <HeartIcon />
                    </Toggle>
                    <Toggle value="item2" variant="accent">
                        <HeartIcon />
                    </Toggle>
                    <Toggle value="item3">
                        <HeartIcon />
                    </Toggle>

                    <ToggleGroup.Separator />

                    <Toggle value="item4" variant="accent">
                        <HeartIcon />
                    </Toggle>
                    <Toggle value="item5">
                        <HeartIcon />
                    </Toggle>
                    <Toggle value="item6" variant="accent">
                        <HeartIcon />
                    </Toggle>
                </ToggleGroup.Root>
            </Grid.Root>
        );
    },
};

const renderCases = ({ size, variant, disabled }: ToggleGroup.Root.Props) => {
    return (
        <ToggleGroup.Root size={size} variant={variant} value={['item3']} disabled={disabled}>
            <Toggle value="item1">
                <HeartIcon />
            </Toggle>
            <ToggleGroup.Separator />
            <Toggle value="item2">
                <HeartIcon />
            </Toggle>
            <ToggleGroup.Separator />
            <Toggle value="item3">
                <HeartIcon />
            </Toggle>
        </ToggleGroup.Root>
    );
};
