import { Flex } from '../flex';
import { Text } from './text';
import type { StoryObj } from '@storybook/react';

export default {
    title: 'Text',
    component: Text,
    argTypes: {
        typography: {
            control: 'inline-radio',
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
        color: {
            control: 'inline-radio',
            options: [
                'primary',
                'primary-darker',
                'secondary',
                'secondary-darker',
                'success',
                'success-darker',
                'danger',
                'danger-darker',
                'warning',
                'warning-darker',
                'contrast',
                'contrast-darker',
                'hint',
                'hint-darker',
                'normal',
                'normal-lighter',
                'accent',
                'accent-darker',
            ],
        },
    },
};

const PANGRAM = '유쾌했던 땃쥐 토끼풀 쫓기 바쁨';

export const Default: StoryObj<typeof Text> = {
    render: () => {
        return (
            <Flex gap="$300">
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
            </Flex>
        );
    },
};

export const TestBed: StoryObj<typeof Text> = {
    render: () => {
        return (
            <Flex gap="$300">
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
            </Flex>
        );
    },
};
