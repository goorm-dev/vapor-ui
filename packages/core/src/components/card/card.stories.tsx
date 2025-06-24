import { Card } from '.';
import type { Meta, StoryObj } from '@storybook/react';

export default {
    title: 'Card',
    component: Card,
} as Meta<typeof Card>;

export const Default: StoryObj<typeof Card> = {
    render: () => (
        <Card>
            <Card.Header>Header</Card.Header>
            <Card.Body>Body</Card.Body>
            <Card.Footer>Footer</Card.Footer>
        </Card>
    ),
};
