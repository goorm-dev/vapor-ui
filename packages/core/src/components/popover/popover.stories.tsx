import type { Meta, StoryObj } from '@storybook/react';

import { Popover } from '.';
import { Button } from '../button';

export default {
    title: 'Popover',
    component: Popover.Root,
    argTypes: {
        side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
        sideOffset: { control: 'number' },
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
        alignOffset: { control: 'number' },
    },
} satisfies Meta<typeof Popover.Root>;

export const Default: StoryObj<typeof Popover.Root> = {
    render: (args) => (
        <div
            style={{
                margin: '100px',
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Popover.Root {...args} open>
                <Popover.Trigger render={<Button>Open Popover</Button>} />
                <Popover.Portal>
                    <Popover.Positioner>
                        <Popover.Content>
                            <Popover.Title>Notifications</Popover.Title>
                            <Popover.Description>
                                You have 3 new messages and 1 new notification.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </div>
    ),
};
