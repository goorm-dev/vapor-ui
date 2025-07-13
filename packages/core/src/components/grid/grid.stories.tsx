import type { ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { vars } from '~/styles/vars.css';

import { Grid } from '.';

export default {
    title: 'Grid',
    component: Grid.Root,
    argTypes: {
        inline: { control: { type: 'boolean' } },
        justify: {
            control: 'inline-radio',
            options: [
                'start',
                'center',
                'end',
                'space-around',
                'space-evenly',
                'space-between',
                'stretch',
            ],
        },
        align: {
            control: 'inline-radio',
            options: ['start', 'center', 'end', 'stretch'],
        },
        flow: {
            control: 'inline-radio',
            options: ['row', 'column', 'row-dense', 'column-dense'],
        },
    },
} as Meta<typeof Grid.Root>;

export const Default: StoryObj<typeof Grid.Root> = {
    render: (args) => {
        return (
            <Grid.Root
                style={{
                    width: 400,
                    backgroundColor: 'GrayText',
                }}
                justifyContent="center"
                alignItems="center"
                templateRows="repeat(3, minmax(40px, auto))"
                templateColumns="1fr 1fr 1fr"
                {...args}
            >
                <Grid.Item asChild colSpan="1 / 3">
                    <Box>1</Box>
                </Grid.Item>
                <Grid.Item asChild colSpan="1 / 3">
                    <Box>2</Box>
                </Grid.Item>
                <Box>3</Box>
                <Box>4</Box>
                <Box>5</Box>
            </Grid.Root>
        );
    },
};

export const TestBed: StoryObj<typeof Grid> = {
    render: (args) => {
        return (
            <Grid.Root
                style={{
                    width: 400,
                    backgroundColor: 'GrayText',
                }}
                justifyContent="center"
                alignItems="center"
                templateRows="repeat(3, minmax(40px, auto))"
                templateColumns="1fr 1fr 1fr"
                {...args}
            >
                <Grid.Item asChild colSpan="1 / 3">
                    <Box>1</Box>
                </Grid.Item>
                <Grid.Item asChild colSpan="1 / 3">
                    <Box>2</Box>
                </Grid.Item>
                <Box>3</Box>
                <Box>4</Box>
                <Box>5</Box>
            </Grid.Root>
        );
    },
};

const Box = ({ style, ...props }: ComponentProps<'div'>) => {
    return (
        <div
            style={{
                backgroundColor: vars.color.background.primary,
                border: '1px solid red',
                textAlign: 'center',
                alignContent: 'center',
                color: 'white',
                ...style,
            }}
            {...props}
        />
    );
};
