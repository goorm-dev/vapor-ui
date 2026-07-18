import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { styles } from './styles';

const meta: Meta = {
    title: 'utility/styles',
};

export default meta;

type Story = StoryObj;

export const Static: Story = {
    render: () => (
        <div className={styles({ padding: '$400', backgroundColor: '$blue-100' })}>
            static padding + background
        </div>
    ),
};

export const Responsive: Story = {
    render: () => (
        <div className={styles({ padding: { default: '$200', sm: '$100', md: '$400' } })}>
            resize the viewport — sm/md/default padding
        </div>
    ),
};

export const Pseudo: Story = {
    render: () => (
        <button
            type="button"
            className={styles({ color: { default: '$blue-500', _hover: '$red-500' } })}
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
                className={styles({ padding: active ? '$600' : '$200' })}
            >
                toggle padding ({active ? '600' : '200'})
            </button>
        );
    },
};
