import type { ComponentProps } from 'react';

import type { StoryObj } from '@storybook/react-vite';

import { vars } from '~/styles/themes.css';

import { VStack } from '.';
import { Box } from '../box';

export default {
    title: 'VStack',
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

export const Default: StoryObj<typeof VStack> = {
    render: (args) => {
        return (
            <VStack {...args}>
                <CustomBox size={90}>1</CustomBox>
                <CustomBox size={80}>2</CustomBox>
                <CustomBox size={70}>3</CustomBox>
                <CustomBox size={60}>4</CustomBox>
                <CustomBox size={50}>5</CustomBox>
            </VStack>
        );
    },
};

export const TestBed: StoryObj<typeof VStack> = {
    render: (args) => {
        return (
            <VStack {...args}>
                <CustomBox size={90}>1</CustomBox>
                <CustomBox size={80}>2</CustomBox>
                <CustomBox size={70}>3</CustomBox>
                <CustomBox size={60}>4</CustomBox>
                <CustomBox size={50}>5</CustomBox>
            </VStack>
        );
    },
};

const CustomBox = ({ size = 50, ...props }: ComponentProps<typeof Box> & { size?: number }) => {
    return (
        <Box
            backgroundColor="$primary"
            width={`${size}px`}
            height={`${size}px`}
            border="1px solid white"
            textAlign="center"
            alignContent="center"
            color="$normal-200"
            {...props}
        />
    );
};
