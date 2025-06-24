import { Nav } from './nav';
import type { StoryObj } from '@storybook/react';

export default {
    title: 'Nav',
    component: Nav,
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
        shape: {
            control: { type: 'inline-radio' },
            options: ['fill', 'ghost'],
        },
        align: {
            control: { type: 'inline-radio' },
            options: ['start', 'center', 'end'],
        },
        direction: {
            control: { type: 'inline-radio' },
            options: ['horizontal', 'vertical'],
        },
        stretch: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
    },
};

export const Default: StoryObj<typeof Nav> = {
    render: (args) => {
        return (
            <>
                <Nav {...args} label="Main">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link disabled={args.disabled} selected href="#">
                                Link 1
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link disabled={args.disabled} href="#">
                                23411234
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.LinkItem disabled={args.disabled} href="#">
                            213412341234
                        </Nav.LinkItem>
                        <Nav.Item>
                            <Nav.Link disabled={args.disabled} href="#">
                                asdf
                            </Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav>
            </>
        );
    },
};
