import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TextInput } from '../text-input';
import { InputGroup } from './input-group';

describe('InputGroup', () => {
    describe('functionality', () => {
        it('should display character count when TextInput has value', async () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Counter />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            await userEvent.type(input, 'hello');

            const counter = screen.getByText('5/10');
            expect(counter).toBeInTheDocument();
        });

        it('should update character count as user types', async () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Counter data-testid="counter" />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            const counter = screen.getByTestId('counter');

            await userEvent.type(input, 'h');
            expect(counter).toHaveTextContent('1/10');

            await userEvent.type(input, 'ello');
            expect(counter).toHaveTextContent('5/10');

            await userEvent.type(input, ' world');
            expect(counter).toHaveTextContent('10/10');
        });

        it('should show only current count when no maxLength is provided', async () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" />
                    <InputGroup.Counter data-testid="counter" />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            const counter = screen.getByTestId('counter');

            await userEvent.type(input, 'hello');

            expect(counter).toHaveTextContent('5');
        });

        it('should work with custom Count render prop', async () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={20} />
                    <InputGroup.Counter data-testid="counter">
                        {({ count, maxLength }) => `${count} of ${maxLength} characters`}
                    </InputGroup.Counter>
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            const counter = screen.getByTestId('counter');

            await userEvent.type(input, 'test');

            expect(counter).toHaveTextContent('4 of 20 characters');
        });

        it('should handle backspace and deletion correctly', async () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Counter data-testid="counter" />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            const counter = screen.getByTestId('counter');

            await userEvent.type(input, 'hello');
            expect(counter).toHaveTextContent('5/10');

            await userEvent.keyboard('{Backspace}{Backspace}');
            expect(counter).toHaveTextContent('3/10');
        });

        it('should show 0 count initially', () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Counter data-testid="counter" />
                </InputGroup.Root>,
            );

            const counter = screen.getByTestId('counter');
            expect(counter).toHaveTextContent('0/10');
        });

        it('should work with defaultValue from TextInput', () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} defaultValue="initial" />
                    <InputGroup.Counter data-testid="counter" />
                </InputGroup.Root>,
            );

            const counter = screen.getByTestId('counter');
            expect(counter).toHaveTextContent('7/10');
        });

        it('should handle multiple InputGroups independently', async () => {
            render(
                <div>
                    <InputGroup.Root>
                        <TextInput placeholder="First input" maxLength={5} />
                        <InputGroup.Counter data-testid="count1" />
                    </InputGroup.Root>
                    <InputGroup.Root>
                        <TextInput placeholder="Second input" maxLength={10} />
                        <InputGroup.Counter data-testid="count2" />
                    </InputGroup.Root>
                </div>,
            );

            const input1 = screen.getByPlaceholderText('First input');
            const input2 = screen.getByPlaceholderText('Second input');

            await userEvent.type(input1, 'hi');
            await userEvent.type(input2, 'hello');

            expect(screen.getByTestId('count1')).toHaveTextContent('2/5');
            expect(screen.getByTestId('count2')).toHaveTextContent('5/10');
        });

        it('should work with controlled TextInput component', () => {
            const ControlledComponent = () => {
                const [value, setValue] = React.useState('initial');

                return (
                    <InputGroup.Root>
                        <TextInput
                            placeholder="Controlled input"
                            maxLength={15}
                            value={value}
                            onValueChange={setValue}
                        />
                        <InputGroup.Counter data-testid="counter" />
                    </InputGroup.Root>
                );
            };

            render(<ControlledComponent />);

            const counter = screen.getByTestId('counter');
            expect(counter).toHaveTextContent('7/15');
        });

        it('should count space characters correctly', async () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={20} />
                    <InputGroup.Counter data-testid="counter" />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            const counter = screen.getByTestId('counter');

            // Type text with multiple spaces
            await userEvent.type(input, 'hello   world');
            expect(counter).toHaveTextContent('13/20');

            // Add more spaces
            await userEvent.type(input, '    ');
            expect(counter).toHaveTextContent('17/20');

            // Clear input and type spaces at the beginning
            await userEvent.clear(input);
            await userEvent.type(input, '  hello world');
            expect(counter).toHaveTextContent('13/20');
        });

        it('should support static ReactNode children', async () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Counter data-testid="counter">
                        <span>Custom counter content</span>
                    </InputGroup.Counter>
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            const counter = screen.getByTestId('counter');

            // Should display static content regardless of input
            expect(counter).toHaveTextContent('Custom counter content');

            await userEvent.type(input, 'hello');
            expect(counter).toHaveTextContent('Custom counter content');
        });

        it('should support both function and static children types', () => {
            const { rerender } = render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} defaultValue="test" />
                    <InputGroup.Counter data-testid="counter">
                        {({ count, maxLength }) => `Dynamic: ${count}/${maxLength}`}
                    </InputGroup.Counter>
                </InputGroup.Root>,
            );

            const counter = screen.getByTestId('counter');
            expect(counter).toHaveTextContent('Dynamic: 4/10');

            // Rerender with static children
            rerender(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} defaultValue="test" />
                    <InputGroup.Counter data-testid="counter">Static content</InputGroup.Counter>
                </InputGroup.Root>,
            );

            expect(counter).toHaveTextContent('Static content');
        });
    });
});
