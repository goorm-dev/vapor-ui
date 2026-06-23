import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { $style } from './$style';

const meta: Meta = {
    title: 'utility/$style',
};

export default meta;

type Story = StoryObj;

export const Static: Story = {
    render: () => (
        <div className={$style({ padding: '$400', backgroundColor: '$blue-100' })}>
            static padding + background
        </div>
    ),
};

export const Responsive: Story = {
    render: () => (
        <div className={$style({ padding: { default: '$200', sm: '$100', md: '$400' } })}>
            resize the viewport — sm/md/default padding
        </div>
    ),
};

export const Pseudo: Story = {
    render: () => (
        <button
            type="button"
            className={$style({ color: { default: '$blue-500', _hover: '$red-500' } })}
        >
            hover me
        </button>
    ),
};

export const Ternary: Story = {
    render: () => {
        const [active, setActive] = useState(false);
        return (
            <button
                type="button"
                onClick={() => setActive((v) => !v)}
                className={$style({ padding: active ? '$600' : '$200' })}
            >
                toggle padding ({active ? '600' : '200'})
            </button>
        );
    },
};
