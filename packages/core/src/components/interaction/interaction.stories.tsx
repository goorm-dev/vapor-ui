import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '../box';
import { VStack } from '../v-stack';
import { Interaction } from './interaction';

export default {
    title: 'Interaction',
    component: Interaction,
    argTypes: {
        scale: { control: 'inline-radio', options: ['normal', 'light'] },
        type: { control: 'inline-radio', options: ['default', 'form', 'roving'] },
    },
} as Meta<typeof Interaction>;

type Story = StoryObj<typeof Interaction>;

export const Default: Story = {
    render: (args) => (
        <Interaction {...args} type="form">
            <Box $css={{ display: 'inline-block', padding: '16px', border: '1px solid' }}>
                Interactive button
            </Box>
        </Interaction>
    ),
};

export const TestBed: Story = {
    parameters: {
        pseudo: {
            hover: ['#default-hover', '#light-hover', '#form-hover'],
            focus: '#form-focus',
            focusVisible: '#default-focus-visible',
            active: ['#default-active', '#roving-active'],
        },
    },
    render: (args) => {
        const boxCss = { display: 'inline-block', padding: '16px', border: '1px solid' } as const;
        return (
            <VStack $css={{ gap: '$200' }}>
                <Interaction {...args}>
                    <Box $css={boxCss}>default / rest</Box>
                </Interaction>
                <Interaction {...args}>
                    <Box id="default-hover" $css={boxCss}>
                        default / hover
                    </Box>
                </Interaction>
                <Interaction {...args}>
                    <Box id="default-focus-visible" $css={boxCss}>
                        default / focus-visible
                    </Box>
                </Interaction>
                <Interaction {...args}>
                    <Box id="default-active" $css={boxCss}>
                        default / active
                    </Box>
                </Interaction>

                <Interaction scale="light">
                    <Box $css={boxCss}>light / rest</Box>
                </Interaction>
                <Interaction scale="light">
                    <Box id="light-hover" $css={boxCss}>
                        light / hover
                    </Box>
                </Interaction>

                <Interaction type="form">
                    <input type="text" placeholder="form / rest" />
                </Interaction>
                <Interaction type="form">
                    <input id="form-hover" type="text" placeholder="form / hover" />
                </Interaction>
                <Interaction type="form">
                    <input id="form-focus" type="text" placeholder="form / focus" />
                </Interaction>

                <Interaction type="roving">
                    <Box $css={boxCss}>roving / rest</Box>
                </Interaction>
                <Interaction type="roving">
                    <Box data-highlighted $css={boxCss}>
                        roving / highlighted
                    </Box>
                </Interaction>
                <Interaction type="roving">
                    <Box id="roving-active" data-highlighted $css={boxCss}>
                        roving / highlighted + active
                    </Box>
                </Interaction>
            </VStack>
        );
    },
};
