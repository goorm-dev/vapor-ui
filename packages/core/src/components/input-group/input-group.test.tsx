import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TextInput } from '../text-input';
import { InputGroup } from './input-group';

describe('InputGroup', () => {
    describe('functionality', () => {
        it('should display character count when TextInput has value', async () => {
            const user = userEvent.setup();

            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Count />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            await user.type(input, 'hello');

            expect(screen.getByText('5/10')).toBeInTheDocument();
        });

        it('should update character count as user types', async () => {
            const user = userEvent.setup();

            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Count />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');

            await user.type(input, 'h');
            expect(screen.getByText('1/10')).toBeInTheDocument();

            await user.type(input, 'ello');
            expect(screen.getByText('5/10')).toBeInTheDocument();

            await user.type(input, ' world');
            expect(screen.getByText('10/10')).toBeInTheDocument();
        });

        it('should show only current count when no maxLength is provided', async () => {
            const user = userEvent.setup();

            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" />
                    <InputGroup.Count />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            await user.type(input, 'hello');

            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should work with custom Count render prop', async () => {
            const user = userEvent.setup();

            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={20} />
                    <InputGroup.Count>
                        {({ current, maxLength }) => `${current} of ${maxLength} characters`}
                    </InputGroup.Count>
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');
            await user.type(input, 'test');

            expect(screen.getByText('4 of 20 characters')).toBeInTheDocument();
        });

        it('should handle backspace and deletion correctly', async () => {
            const user = userEvent.setup();

            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Count />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');

            await user.type(input, 'hello');
            expect(screen.getByText('5/10')).toBeInTheDocument();

            await user.keyboard('{Backspace}{Backspace}');
            expect(screen.getByText('3/10')).toBeInTheDocument();
        });

        it('should show 0 count initially', () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Count />
                </InputGroup.Root>,
            );

            expect(screen.getByText('0/10')).toBeInTheDocument();
        });

        it('should work with defaultValue from TextInput', () => {
            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} defaultValue="initial" />
                    <InputGroup.Count />
                </InputGroup.Root>,
            );

            expect(screen.getByText('7/10')).toBeInTheDocument();
        });

        it('should handle clear input correctly', async () => {
            const user = userEvent.setup();

            render(
                <InputGroup.Root>
                    <TextInput placeholder="Enter text" maxLength={10} />
                    <InputGroup.Count />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Enter text');

            await user.type(input, 'hello');
            expect(screen.getByText('5/10')).toBeInTheDocument();

            await user.clear(input);
            expect(screen.getByText('0/10')).toBeInTheDocument();
        });

        it('should work without InputGroup when TextInput is used standalone', async () => {
            const user = userEvent.setup();

            render(<TextInput placeholder="Standalone input" maxLength={5} />);

            const input = screen.getByPlaceholderText('Standalone input');
            await user.type(input, 'test');

            // Should work normally without throwing errors
            expect(input).toHaveValue('test');
        });

        it('should handle multiple InputGroups independently', async () => {
            const user = userEvent.setup();

            render(
                <div>
                    <InputGroup.Root>
                        <TextInput placeholder="First input" maxLength={5} />
                        <InputGroup.Count data-testid="count1" />
                    </InputGroup.Root>
                    <InputGroup.Root>
                        <TextInput placeholder="Second input" maxLength={10} />
                        <InputGroup.Count data-testid="count2" />
                    </InputGroup.Root>
                </div>,
            );

            const input1 = screen.getByPlaceholderText('First input');
            const input2 = screen.getByPlaceholderText('Second input');

            await user.type(input1, 'hi');
            await user.type(input2, 'hello');

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
                        <InputGroup.Count />
                    </InputGroup.Root>
                );
            };

            render(<ControlledComponent />);
            
            expect(screen.getByText('7/15')).toBeInTheDocument();
        });
    });
});
