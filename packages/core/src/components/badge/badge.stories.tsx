import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '.';

const OPTIONS = {
    colorPalette: ['primary', 'success', 'warning', 'danger', 'contrast', 'hint'] as const,
    size: ['sm', 'md', 'lg'] as const,
    shape: ['square', 'pill'] as const,
};

export default {
    title: 'Badge',
    argTypes: {
        colorPalette: {
            control: 'inline-radio',
            options: OPTIONS.colorPalette,
        },
        size: { control: 'inline-radio', options: OPTIONS.size },
        shape: { control: 'inline-radio', options: OPTIONS.shape },
    },
} as Meta<typeof Badge>;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    render: (args) => <Badge {...args}>Badge</Badge>,
};

export const TestBed: Story = {
    render: () => (
        <div>
            {OPTIONS.colorPalette.map((colorPalette) => (
                <div key={colorPalette} style={{ marginBottom: '1rem' }}>
                    {OPTIONS.size.map((size) => (
                        <div key={size} style={{ marginBottom: '0.5rem' }}>
                            {OPTIONS.shape.map((shape) => (
                                <Badge
                                    key={shape}
                                    colorPalette={colorPalette}
                                    size={size}
                                    shape={shape}
                                    style={{ marginRight: '0.5rem' }}
                                >
                                    {`${colorPalette} | ${size} | ${shape}`}
                                </Badge>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    ),
};
