import { Avatar } from '.';
import { Flex } from '../flex';
import type { Meta, StoryObj } from '@storybook/react';

export default {
    title: 'Avatar',
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        shape: { control: 'inline-radio', options: ['square', 'circle'] },
    },
} as Meta<typeof Avatar>;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
    render: (args) => (
        <>
            <Flex>
                <Avatar.Simple
                    size="sm"
                    src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="hi"
                />
                <Avatar.Simple
                    size="md"
                    src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="hi"
                />
                <Avatar.Simple
                    size="lg"
                    src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="hi"
                />
                <Avatar.Simple
                    size="xl"
                    src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="hi"
                />
            </Flex>
            <Flex>
                <Avatar.Simple
                    size="sm"
                    src="https://images.unsplashd.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="1"
                />
                <Avatar.Simple
                    size="md"
                    src="https://images.unsplashd.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="2"
                />
                <Avatar.Simple
                    size="lg"
                    src="https://images.unsplashd.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="3"
                />
                <Avatar.Simple
                    size="xl"
                    src="https://images.unsplashd.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="4"
                />
            </Flex>
            <Flex>
                <Avatar.Simple
                    size="sm"
                    src="https://images.unsplashd.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="noah.choi"
                />
                <Avatar.Simple
                    size="md"
                    src="https://images.unsplashd.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="noah.choi"
                />
                <Avatar.Simple
                    size="lg"
                    src="https://images.unsplashd.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="noah.choi"
                />
                <Avatar.Simple
                    size="xl"
                    src="https://images.unsplashd.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    {...args}
                    alt="noah.choi"
                />
            </Flex>
        </>
    ),
};
