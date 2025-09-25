import type { Meta, StoryObj } from '@storybook/react';

import { VStack } from '../v-stack';
import { Text } from './text';

export default {
    title: 'Text',
    component: Text,
    argTypes: {
        typography: {
            control: 'select',
            options: [
                'display1',
                'display2',
                'display3',
                'display4',
                'heading1',
                'heading2',
                'heading3',
                'heading4',
                'heading5',
                'heading6',
                'body1',
                'body2',
                'body3',
                'body4',
                'code1',
                'code2',
            ],
        },
        foreground: {
            control: 'select',
            options: [
                'primary-100',
                'primary-200',
                'secondary-100',
                'secondary-200',
                'success-100',
                'success-200',
                'danger-100',
                'danger-200',
                'warning-100',
                'warning-200',
                'contrast-100',
                'contrast-200',
                'hint-100',
                'hint-200', 
                'normal-100',
                'normal-200',
            ],
        },
    },
} as Meta<typeof Text>;

const PANGRAM = 'Bright vixens jump; dozy fowl quack.';

export const Default: StoryObj<typeof Text> = {
    render: (args) => {
        return (
            <VStack gap="$300">
                <Text typography="code2" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="code1" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="body4" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="body3" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="body2" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="body1" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="heading6" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="heading5" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="heading4" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="heading3" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="heading2" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="heading1" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="display4" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="display3" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="display2" {...args}>
                    {PANGRAM}
                </Text>
                <Text typography="display1" {...args}>
                    {PANGRAM}
                </Text>
            </VStack>
        );
    },
};

export const TestBed: StoryObj<typeof Text> = {
    render: () => {
        return (
            <VStack gap="$050">
                <Text typography="code2">{PANGRAM}</Text>
                <Text typography="code1">{PANGRAM}</Text>

                <Text typography="body4">{PANGRAM}</Text>
                <Text typography="body3">{PANGRAM}</Text>
                <Text typography="body2">{PANGRAM}</Text>
                <Text typography="body1">{PANGRAM}</Text>

                <Text typography="heading6">{PANGRAM}</Text>
                <Text typography="heading5">{PANGRAM}</Text>
                <Text typography="heading4">{PANGRAM}</Text>
                <Text typography="heading3">{PANGRAM}</Text>
                <Text typography="heading2">{PANGRAM}</Text>
                <Text typography="heading1">{PANGRAM}</Text>

                <Text typography="display4">{PANGRAM}</Text>
                <Text typography="display3">{PANGRAM}</Text>
                <Text typography="display2">{PANGRAM}</Text>
                <Text typography="display1">{PANGRAM}</Text>
            </VStack>
        );
    },
};
