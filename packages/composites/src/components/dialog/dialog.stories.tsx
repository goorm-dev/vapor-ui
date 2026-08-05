import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dialog } from './dialog';

export default {
    title: 'Composites/Dialog',
    component: Dialog,
} satisfies Meta<typeof Dialog>;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
    render: () => {
        return <Dialog />;
    },
};
