import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { InputGroup } from '.';
import { Field } from '../field';

/**
 * 이 스위트는 jsdom 레이어의 책임만 검증한다 — 접근성, DOM 속성(data-*, aria-invalid, :disabled),
 * disabled/readOnly 의 래퍼 전파. 시각 기하(테두리·focus 링·:has 반응)는 Storybook/Playwright 담당.
 */
describe('InputGroup', () => {
    describe('accessibility & structure', () => {
        it('should have no a11y violations', async () => {
            const { container } = render(
                <InputGroup.Root>
                    <InputGroup.LeadingAddon>$</InputGroup.LeadingAddon>
                    <InputGroup.Input placeholder="Amount" aria-label="Amount" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button aria-label="clear">x</InputGroup.Button>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            expect(await axe(container)).toHaveNoViolations();
        });

        it('should not set role by default (single input + decoration is not a group)', () => {
            render(
                <InputGroup.Root data-testid="group">
                    <InputGroup.Input placeholder="Search" />
                </InputGroup.Root>,
            );

            expect(screen.getByTestId('group')).not.toHaveAttribute('role');
        });

        it('should forward a consumer-provided role', () => {
            render(
                <InputGroup.Root data-testid="group" role="group">
                    <InputGroup.Input placeholder="Search" />
                </InputGroup.Root>,
            );

            expect(screen.getByTestId('group')).toHaveAttribute('role', 'group');
        });

        it('should render addon slots around the input', () => {
            render(
                <InputGroup.Root>
                    <InputGroup.LeadingAddon>$</InputGroup.LeadingAddon>
                    <InputGroup.Input placeholder="Amount" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button aria-label="clear">x</InputGroup.Button>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            expect(screen.getByText('$')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'clear' })).toBeInTheDocument();
        });
    });

    describe('visual state (Root data-* only)', () => {
        it('should reflect disabled on the Root as data-disabled', () => {
            render(<InputGroup.Root data-testid="group" disabled />);
            expect(screen.getByTestId('group')).toHaveAttribute('data-disabled');
        });

        it('should reflect readOnly on the Root as data-readonly', () => {
            render(<InputGroup.Root data-testid="group" readOnly />);
            expect(screen.getByTestId('group')).toHaveAttribute('data-readonly');
        });

        it('should NOT set state data-* when the corresponding prop is falsy', () => {
            render(<InputGroup.Root data-testid="group" />);
            const group = screen.getByTestId('group');
            expect(group).not.toHaveAttribute('data-disabled');
            expect(group).not.toHaveAttribute('data-readonly');
        });
    });

    describe('state propagation via wrappers', () => {
        it('should disable Input and Button when the group is disabled', () => {
            render(
                <InputGroup.Root disabled>
                    <InputGroup.Input placeholder="amount" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button aria-label="clear">x</InputGroup.Button>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            expect(screen.getByPlaceholderText('amount')).toBeDisabled();
            expect(screen.getByRole('button', { name: 'clear' })).toBeDisabled();
        });

        it('should not let a child re-enable itself against a disabled group (OR, group wins)', () => {
            render(
                <InputGroup.Root disabled>
                    <InputGroup.Input placeholder="amount" disabled={false} />
                </InputGroup.Root>,
            );

            expect(screen.getByPlaceholderText('amount')).toBeDisabled();
        });

        it('should apply readOnly to Input only, leaving Button interactive', () => {
            render(
                <InputGroup.Root readOnly>
                    <InputGroup.Input placeholder="amount" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button aria-label="clear">x</InputGroup.Button>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            expect(screen.getByPlaceholderText('amount')).toHaveAttribute('readonly');
            const button = screen.getByRole('button', { name: 'clear' });
            expect(button).not.toBeDisabled();
            expect(button).not.toHaveAttribute('readonly');
        });

        it('should render standalone (outside a group) without throwing', () => {
            render(<InputGroup.Input placeholder="solo" />);
            const input = screen.getByPlaceholderText('solo');
            expect(input).toBeInTheDocument();
            expect(input).not.toBeDisabled();
        });
    });

    describe('invalid is not propagated', () => {
        it('should NOT put aria-invalid on the Input when only the group signals disabled', () => {
            render(
                <InputGroup.Root disabled>
                    <InputGroup.Input placeholder="amount" />
                </InputGroup.Root>,
            );

            expect(screen.getByPlaceholderText('amount')).not.toHaveAttribute('aria-invalid');
        });

        it('should put aria-invalid only when invalid is set on the control itself', () => {
            render(
                <InputGroup.Root>
                    <InputGroup.Input placeholder="amount" invalid />
                </InputGroup.Root>,
            );

            expect(screen.getByPlaceholderText('amount')).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('Field integration', () => {
        it('should expose aria-invalid on the inner input when Field validation fails', async () => {
            const user = userEvent.setup();
            render(
                <Field.Root
                    validationMode="onChange"
                    validate={(value) => (value === 'bad' ? 'invalid' : null)}
                >
                    <InputGroup.Root>
                        <InputGroup.Input placeholder="Search" />
                    </InputGroup.Root>
                    <Field.Error />
                </Field.Root>,
            );

            const input = screen.getByPlaceholderText('Search');
            await user.type(input, 'bad');

            // Field 가 검증 실패로 자식 input 에 aria-invalid 를 붙이고,
            // Root 는 이를 :has([aria-invalid='true']) 로 잡는다(테두리 반응은 Storybook 검증).
            await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
        });

        it('should mark the inner input as disabled when Field is disabled', () => {
            render(
                <Field.Root disabled>
                    <InputGroup.Root>
                        <InputGroup.Input placeholder="Search" />
                    </InputGroup.Root>
                </Field.Root>,
            );

            expect(screen.getByPlaceholderText('Search')).toBeDisabled();
        });
    });

    describe('composition', () => {
        it('should support the render prop on Root', () => {
            render(<InputGroup.Root data-testid="group" render={<section />} />);
            expect(screen.getByTestId('group').tagName).toBe('SECTION');
        });
    });
});
