import type { ComponentProps } from 'react';

import { HStack } from '.';
import type { StoryObj } from '@storybook/react';

import { vars } from '~/styles/contract.css';

export default {
    title: 'HStack',
    argTypes: {
        reverse: { control: { type: 'boolean' } },
        inline: { control: { type: 'boolean' } },
        justifyContent: {
            control: { type: 'inline-radio' },
            options: ['flex-start', 'center', 'flex-end', 'space-between'],
        },
        alignItems: {
            control: { type: 'inline-radio' },
            options: ['flex-start', 'center', 'flex-end'],
        },
        gap: { control: { type: 'inline-radio' }, options: Object.keys(vars.size.space) },
    },
};

export const Default: StoryObj<typeof HStack> = {
    render: (args) => {
        return (
            <HStack {...args}>
                <Box size={90}>1</Box>
                <Box size={80}>2</Box>
                <Box size={70}>3</Box>
                <Box size={60}>4</Box>
                <Box size={50}>5</Box>
            </HStack>
        );
    },
};

export const TestBed: StoryObj<typeof HStack> = {
    render: (args) => {
        return (
            <HStack {...args}>
                <Box size={90}>1</Box>
                <Box size={80}>2</Box>
                <Box size={70}>3</Box>
                <Box size={60}>4</Box>
                <Box size={50}>5</Box>
            </HStack>
        );
    },
};

const Box = ({ size = 50, style, ...props }: ComponentProps<'div'> & { size?: number }) => {
    return (
        <div
            style={{
                backgroundColor: vars.color.background.primary,
                width: size,
                height: size,
                border: '1px solid white',
                textAlign: 'center',
                alignContent: 'center',
                color: 'white',
                ...style,
            }}
            {...props}
        />
    );
};
