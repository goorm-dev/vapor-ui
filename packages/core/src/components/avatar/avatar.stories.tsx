import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '.';
import { Flex } from '../flex';

export default {
    title: 'Avatar',
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        shape: { control: 'inline-radio', options: ['square', 'circle'] },
    },
} as Meta<typeof Avatar>;

type Story = StoryObj<typeof Avatar>;

const IMAGE_URL = 'https://avatars.githubusercontent.com/u/217160984?v=4';

export const Default: Story = {
    render: (args) => (
        <>
            <Flex>
                <Avatar.Simple size="sm" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Simple size="md" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Simple size="lg" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Simple size="xl" src={IMAGE_URL} {...args} alt="hi" />
            </Flex>
            <Flex>
                <Avatar.Simple size="sm" {...args} alt="1" />
                <Avatar.Simple size="md" {...args} alt="2" />
                <Avatar.Simple size="lg" {...args} alt="3" />
                <Avatar.Simple size="xl" {...args} alt="4" />
            </Flex>
            <Flex>
                <Avatar.Simple size="sm" {...args} alt="noah.choi" />
                <Avatar.Simple size="md" {...args} alt="noah.choi" />
                <Avatar.Simple size="lg" {...args} alt="noah.choi" />
                <Avatar.Root size="xl" {...args} alt="noah.choi">
                    <Avatar.Image />
                    <Avatar.Fallback>asdf</Avatar.Fallback>
                </Avatar.Root>
            </Flex>
        </>
    ),
};

export const TestBed: Story = {
    render: (args) => (
        <>
            <Flex>
                <Avatar.Simple size="sm" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Simple size="md" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Simple size="lg" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Simple size="xl" src={IMAGE_URL} {...args} alt="hi" />
            </Flex>
            <Flex>
                <Avatar.Simple size="sm" {...args} alt="1" />
                <Avatar.Simple size="md" {...args} alt="2" />
                <Avatar.Simple size="lg" {...args} alt="3" />
                <Avatar.Simple size="xl" {...args} alt="4" />
            </Flex>
            <Flex>
                <Avatar.Simple size="sm" {...args} alt="noah.choi" />
                <Avatar.Simple size="md" {...args} alt="noah.choi" />
                <Avatar.Simple size="lg" {...args} alt="noah.choi" />
                <Avatar.Simple size="xl" {...args} alt="noah.choi" />
            </Flex>
        </>
    ),
};
