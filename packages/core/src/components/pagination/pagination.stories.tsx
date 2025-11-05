import type { Meta, StoryObj } from '@storybook/react-vite';

import { Pagination } from '.';
import { VStack } from '../v-stack';

export default {
    title: 'Pagination',
    component: Pagination.Root,
    argTypes: {
        totalPages: { control: { type: 'number' } },
        siblingCount: { control: { type: 'number' } },
        boundaryCount: { control: { type: 'number' } },
        disabled: { control: { type: 'boolean' } },
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
    },
} satisfies Meta<typeof Pagination.Root>;

export const Default: StoryObj<typeof Pagination.Root> = {
    argTypes: {},
    render: (args) => {
        return (
            <Pagination.Root {...args}>
                <Pagination.List>
                    <Pagination.Item>
                        <Pagination.Previous />
                    </Pagination.Item>
                    <Pagination.Item>
                        <Pagination.Button page={1}>1</Pagination.Button>
                    </Pagination.Item>
                    <Pagination.Item>
                        <Pagination.Button page={2}>2</Pagination.Button>
                    </Pagination.Item>
                    <Pagination.Item>
                        <Pagination.Button page={3}>3</Pagination.Button>
                    </Pagination.Item>
                    <Pagination.Item>
                        <Pagination.Button page={4}>4</Pagination.Button>
                    </Pagination.Item>
                    <Pagination.Item>
                        <Pagination.Button page={5}>5</Pagination.Button>
                    </Pagination.Item>
                    <Pagination.Item>
                        <Pagination.Button page={6}>6</Pagination.Button>
                    </Pagination.Item>
                    <Pagination.Item>
                        <Pagination.Button page={7}>7</Pagination.Button>
                    </Pagination.Item>
                    <Pagination.Item>
                        <Pagination.Next />
                    </Pagination.Item>
                </Pagination.List>
            </Pagination.Root>
        );
    },
};

export const Items: StoryObj<typeof Pagination.Root> = {
    args: { totalPages: 25, siblingCount: 2, boundaryCount: 1, defaultPage: 7 },
    render: (args) => {
        return (
            <VStack gap="$100">
                <Pagination.Root {...args}>
                    <Pagination.List>
                        <Pagination.Item>
                            <Pagination.Previous />
                        </Pagination.Item>
                        <Pagination.Items />
                        <Pagination.Item>
                            <Pagination.Next />
                        </Pagination.Item>
                    </Pagination.List>
                </Pagination.Root>
                <Pagination.Root {...args}>
                    <Pagination.List>
                        <Pagination.Item>
                            <Pagination.Previous />
                        </Pagination.Item>
                        <Pagination.Items>
                            {(pages) =>
                                pages.map(({ type, value }) => {
                                    if (type === 'BREAK') {
                                        return (
                                            <Pagination.Item key={`${type}-${value}`}>
                                                <Pagination.Ellipsis />
                                            </Pagination.Item>
                                        );
                                    }

                                    return (
                                        <Pagination.Item key={`${type}-${value}`}>
                                            <Pagination.Button page={value}>
                                                {value}
                                            </Pagination.Button>
                                        </Pagination.Item>
                                    );
                                })
                            }
                        </Pagination.Items>
                        <Pagination.Item>
                            <Pagination.Next />
                        </Pagination.Item>
                    </Pagination.List>
                </Pagination.Root>
            </VStack>
        );
    },
};

export const Links: StoryObj<typeof Pagination.Root> = {
    args: { totalPages: 25, siblingCount: 2, boundaryCount: 1, defaultPage: 7 },
    render: (args) => {
        return (
            <Pagination.Root {...args}>
                <Pagination.List>
                    <Pagination.Item>
                        <Pagination.Previous />
                    </Pagination.Item>
                    <Pagination.Items>
                        {(pages) =>
                            pages.map(({ type, value }) => {
                                if (type === 'BREAK') {
                                    return (
                                        <Pagination.Item key={`${type}-${value}`}>
                                            <Pagination.Ellipsis />
                                        </Pagination.Item>
                                    );
                                }

                                return (
                                    <Pagination.Item key={`${type}-${value}`}>
                                        <Pagination.Button
                                            // eslint-disable-next-line jsx-a11y/anchor-has-content
                                            render={<a href={`#${value}`} />}
                                            page={value}
                                        >
                                            {value}
                                        </Pagination.Button>
                                    </Pagination.Item>
                                );
                            })
                        }
                    </Pagination.Items>
                    <Pagination.Item>
                        <Pagination.Next />
                    </Pagination.Item>
                </Pagination.List>
            </Pagination.Root>
        );
    },
};

export const TestBed: StoryObj<typeof Pagination.Root> = {
    args: { totalPages: 25, siblingCount: 2, boundaryCount: 1, defaultPage: 7 },
    render: (args) => {
        return (
            <VStack gap="$100">
                <Pagination.Root {...args}>
                    <Pagination.List>
                        <Pagination.Item>
                            <Pagination.Previous disabled />
                        </Pagination.Item>
                        <Pagination.Items />
                        <Pagination.Item>
                            <Pagination.Next />
                        </Pagination.Item>
                    </Pagination.List>
                </Pagination.Root>
                <Pagination.Root {...args}>
                    <Pagination.List>
                        <Pagination.Item>
                            <Pagination.Previous />
                        </Pagination.Item>
                        <Pagination.Items>
                            {(pages) =>
                                pages.map(({ type, value }) => {
                                    if (type === 'BREAK') {
                                        return (
                                            <Pagination.Item key={`${type}-${value}`}>
                                                <Pagination.Ellipsis />
                                            </Pagination.Item>
                                        );
                                    }

                                    return (
                                        <Pagination.Item key={`${type}-${value}`}>
                                            <Pagination.Button page={value}>
                                                {value}
                                            </Pagination.Button>
                                        </Pagination.Item>
                                    );
                                })
                            }
                        </Pagination.Items>
                        <Pagination.Item>
                            <Pagination.Next />
                        </Pagination.Item>
                    </Pagination.List>
                </Pagination.Root>
                <Pagination.Root {...args} disabled>
                    <Pagination.List>
                        <Pagination.Item>
                            <Pagination.Previous />
                        </Pagination.Item>
                        <Pagination.Items />
                        <Pagination.Item>
                            <Pagination.Next />
                        </Pagination.Item>
                    </Pagination.List>
                </Pagination.Root>
            </VStack>
        );
    },
};
