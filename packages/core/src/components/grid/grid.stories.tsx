import type { ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { vars } from '~/styles/themes.css';

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
                $styles={{
                    width: 400,
                    backgroundColor: 'GrayText',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                templateRows="repeat(3, minmax(40px, auto))"
                templateColumns="1fr 1fr 1fr"
                {...args}
            >
                <Grid.Item render={<Box>1</Box>} colSpan="1 / 3" />
                <Grid.Item render={<Box>2</Box>} colSpan="1 / 3" />
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
                $styles={{
                    width: 400,
                    backgroundColor: 'GrayText',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                templateRows="repeat(3, minmax(40px, auto))"
                templateColumns="1fr 1fr 1fr"
                {...args}
            >
                <Grid.Item render={<Box>1</Box>} colSpan="1 / 3" />
                <Grid.Item render={<Box>2</Box>} colSpan="1 / 3" />
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
                backgroundColor: vars.color.background.primary[200],
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
