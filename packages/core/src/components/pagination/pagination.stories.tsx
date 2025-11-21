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
    args: { totalPages: 7, defaultPage: 1 },
    render: (args) => {
        return (
            <Pagination.Root onPageChange={(page) => console.log(page)} {...args}>
                <Pagination.Previous />
                <Pagination.Button page={1}>1</Pagination.Button>
                <Pagination.Button page={2}>2</Pagination.Button>
                <Pagination.Button page={3}>3</Pagination.Button>
                <Pagination.Button page={4}>4</Pagination.Button>
                <Pagination.Button page={5}>5</Pagination.Button>
                <Pagination.Button page={6}>6</Pagination.Button>
                <Pagination.Button page={7}>7</Pagination.Button>
                <Pagination.Next />
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
                    <Pagination.Previous />
                    <Pagination.Items />
                    <Pagination.Next />
                </Pagination.Root>

                <Pagination.Root {...args}>
                    <Pagination.Previous />
                    <Pagination.Items>
                        {(pages) =>
                            pages.map(({ type, value }) => {
                                if (type === 'BREAK') {
                                    return <Pagination.Ellipsis key={`${type}-${value}`} />;
                                }

                                return (
                                    <Pagination.Button key={`${type}-${value}`} page={value}>
                                        {value}
                                    </Pagination.Button>
                                );
                            })
                        }
                    </Pagination.Items>
                    <Pagination.Next />
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
                <Pagination.Previous />
                <Pagination.Items>
                    {(pages) =>
                        pages.map(({ type, value }) => {
                            if (type === 'BREAK') {
                                return <Pagination.Ellipsis key={`${type}-${value}`} />;
                            }

                            return (
                                <Pagination.Button
                                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                                    render={<a href={`#${value}`} />}
                                    key={`${type}-${value}`}
                                    page={value}
                                >
                                    {value}
                                </Pagination.Button>
                            );
                        })
                    }
                </Pagination.Items>
                <Pagination.Next />
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
                    <Pagination.Previous disabled />

                    <Pagination.Items />

                    <Pagination.Next />
                </Pagination.Root>

                <Pagination.Root {...args}>
                    <Pagination.Previous />

                    <Pagination.Items>
                        {(pages) =>
                            pages.map(({ type, value }) => {
                                if (type === 'BREAK') {
                                    return <Pagination.Ellipsis key={`${type}-${value}`} />;
                                }

                                return (
                                    <Pagination.Button key={`${type}-${value}`} page={value}>
                                        {value}
                                    </Pagination.Button>
                                );
                            })
                        }
                    </Pagination.Items>

                    <Pagination.Next />
                </Pagination.Root>
                <Pagination.Root {...args} disabled>
                    <Pagination.Previous />

                    <Pagination.Items />

                    <Pagination.Next />
                </Pagination.Root>

                <Pagination.Root {...args} size="lg">
                    <Pagination.Previous disabled />

                    <Pagination.Items />

                    <Pagination.Next />
                </Pagination.Root>
            </VStack>
        );
    },
};
