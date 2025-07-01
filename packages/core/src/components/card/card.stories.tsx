import { Card } from '.';
import type { Meta, StoryObj } from '@storybook/react';

export default {
    title: 'Card',
    component: Card.Root,
    subcomponents: {
        Header: Card.Header,
        Body: Card.Body,
        Footer: Card.Footer,
    },
} as Meta<typeof Card.Root>;

export const Default: StoryObj<typeof Card> = {
    render: () => (
        <Card.Root>
            <Card.Header>Header</Card.Header>
            <Card.Body>Body</Card.Body>
            <Card.Footer>Footer</Card.Footer>
        </Card.Root>
    ),
};

export const TestBed: StoryObj<typeof Card> = {
    render: () => (
        <Card.Root>
            <Card.Header>Header</Card.Header>
            <Card.Body>Body</Card.Body>
            <Card.Footer>Footer</Card.Footer>
        </Card.Root>
    ),
};

export const TestBed: StoryObj<typeof Card> = {
    render: () => (
        <Card>
            <Card.Header>Header</Card.Header>
            <Card.Body>Body</Card.Body>
            <Card.Footer>Footer</Card.Footer>
        </Card>
    ),
};
