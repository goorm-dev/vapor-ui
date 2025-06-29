import type { ComponentProps } from 'react';

import { Grid } from '.';
import type { Meta, StoryObj } from '@storybook/react';

import { vars } from '~/styles/contract.css';

export default {
    title: 'Grid',
    component: Grid,
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
} as Meta<typeof Grid>;

export const Default: StoryObj<typeof Grid> = {
    render: (args) => {
        return (
            <Grid
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
            </Grid>
        );
    },
};

export const TestBed = {
    render: () => {
        return (
            <>
                <Grid
                    inline
                    templateRows="repeat(2, 1fr)"
                    templateColumns="repeat(2, 1fr)"
                    gap="200"
                >
                    <Grid>
                        <Box style={{ width: 100, height: 100 }} />
                        <Box style={{ width: 100, height: 100 }} />
                        <Box style={{ width: 100, height: 100 }} />
                    </Grid>
                </Grid>
                <Grid inline>
                    <Box style={{ width: 100, height: 100 }} />
                    <Box style={{ width: 100, height: 100 }} />
                    <Box style={{ width: 100, height: 100 }} />
                </Grid>
            </>
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
