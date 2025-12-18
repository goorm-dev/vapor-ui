import type { ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeartIcon } from '@vapor-ui/icons';

import { IconButton } from '.';
import { Text } from '../text';

export default {
    title: 'IconButton',
    component: IconButton,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        colorPalette: {
            control: 'inline-radio',
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'contrast'],
        },
        variant: { control: 'inline-radio', options: ['fill', 'outline', 'ghost'] },
        shape: { control: 'inline-radio', options: ['square', 'circle'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof IconButton>;

type Story = StoryObj<IconButton.Props>;

export const Default: Story = {
    render: (args) => (
        <>
            <IconButton {...args}>
                <HeartIcon />
            </IconButton>
            <IconButton {...args}>
                <CheckIcon />
            </IconButton>
            <IconButton {...args}>test</IconButton>
            <IconButton {...args}>👍</IconButton>
            <IconButton {...args}>
                <Text className="text">Text</Text>
            </IconButton>
        </>
    ),
};

interface IconProps extends ComponentProps<'svg'> {}

const CheckIcon = (props: IconProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.5374 1.93469C10.9206 1.3551 9.92198 1.3551 9.30673 1.93469L3.99987 6.92127L2.69208 5.6939C2.07684 5.1143 1.07825 5.1143 0.461432 5.6939C-0.153811 6.27201 -0.153811 7.21033 0.461432 7.78992L2.88454 10.0653C3.49979 10.6449 4.49837 10.6449 5.11519 10.0653L11.5374 4.03072C12.1542 3.45261 12.1542 2.51429 11.5374 1.93469"
                fill="currentColor"
            />
        </svg>
    );
};

export const TestBed: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex' }}>
                <IconButtons colorPalette="primary" />
                <IconButtons colorPalette="primary" disabled />
                <IconButtons colorPalette="secondary" />
                <IconButtons colorPalette="secondary" disabled />
                <IconButtons colorPalette="success" />
                <IconButtons colorPalette="success" disabled />
                <IconButtons colorPalette="warning" />
                <IconButtons colorPalette="warning" disabled />
                <IconButtons colorPalette="danger" />
                <IconButtons colorPalette="danger" disabled />
                <IconButtons colorPalette="contrast" />
                <IconButtons colorPalette="contrast" disabled />
            </div>

            <div>
                <IconButton aria-label="SM Label" size="sm">
                    <HeartIcon />
                </IconButton>
                <IconButton aria-label="MD Label" size="md">
                    <HeartIcon />
                </IconButton>
                <IconButton aria-label="LG Label" size="lg">
                    <HeartIcon />
                </IconButton>
                <IconButton aria-label="XL Label" size="xl">
                    <HeartIcon />
                </IconButton>
                <IconButton aria-label="Rounded Label" shape="circle">
                    <HeartIcon />
                </IconButton>
            </div>
        </div>
    ),
};

const IconButtons = ({ colorPalette, disabled }: Partial<IconButton.Props>) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <IconButton
                aria-label="Button Label"
                colorPalette={colorPalette}
                disabled={disabled}
                variant="fill"
            >
                <HeartIcon />
            </IconButton>
            <IconButton
                aria-label="Button Label"
                colorPalette={colorPalette}
                disabled={disabled}
                variant="ghost"
            >
                <HeartIcon />
            </IconButton>
            <IconButton
                aria-label="Button Label"
                colorPalette={colorPalette}
                disabled={disabled}
                variant="outline"
            >
                <HeartIcon />
            </IconButton>
        </div>
    );
};
