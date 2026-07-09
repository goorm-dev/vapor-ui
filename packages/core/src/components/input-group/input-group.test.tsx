import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { InputGroup } from '.';
import { Field } from '../field';
import { IconButton } from '../icon-button';
import { TextInput } from '../text-input';

/**
 * 이 스위트는 jsdom 레이어의 책임만 검증한다 — 접근성, DOM 속성(data-*, aria-invalid, :disabled),
 * 상태가 자식에 전파되지 '않음'. 시각 기하(테두리·focus 링·:has 반응)는 Storybook/Playwright 담당.
 */
describe('InputGroup', () => {
    describe('accessibility & structure', () => {
        it('should have no a11y violations', async () => {
            const { container } = render(
                <InputGroup.Root>
                    <InputGroup.LeadingAddon>$</InputGroup.LeadingAddon>
                    <TextInput placeholder="Amount" aria-label="Amount" />
                    <InputGroup.TrailingAddon>
                        <IconButton aria-label="clear">x</IconButton>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            expect(await axe(container)).toHaveNoViolations();
        });

        it('should not set role by default (single input + decoration is not a group)', () => {
            render(
                <InputGroup.Root data-testid="group">
                    <TextInput placeholder="Search" />
                </InputGroup.Root>,
            );

            expect(screen.getByTestId('group')).not.toHaveAttribute('role');
        });

        it('should forward a consumer-provided role', () => {
            render(
                <InputGroup.Root data-testid="group" role="group">
                    <TextInput placeholder="Search" />
                </InputGroup.Root>,
            );

            expect(screen.getByTestId('group')).toHaveAttribute('role', 'group');
        });

        it('should render addon slots around the input', () => {
            render(
                <InputGroup.Root>
                    <InputGroup.LeadingAddon>$</InputGroup.LeadingAddon>
                    <TextInput placeholder="Amount" />
                    <InputGroup.TrailingAddon>
                        <IconButton aria-label="clear">x</IconButton>
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

        it('should reflect invalid on the Root as data-invalid', () => {
            render(<InputGroup.Root data-testid="group" invalid />);
            expect(screen.getByTestId('group')).toHaveAttribute('data-invalid');
        });

        it('should reflect readOnly on the Root as data-readonly', () => {
            render(<InputGroup.Root data-testid="group" readOnly />);
            expect(screen.getByTestId('group')).toHaveAttribute('data-readonly');
        });

        it('should NOT set state data-* when the corresponding prop is falsy', () => {
            render(<InputGroup.Root data-testid="group" />);
            const group = screen.getByTestId('group');
            expect(group).not.toHaveAttribute('data-disabled');
            expect(group).not.toHaveAttribute('data-invalid');
            expect(group).not.toHaveAttribute('data-readonly');
        });

        it('should NOT propagate group state to inner controls', () => {
            render(
                <InputGroup.Root disabled invalid>
                    <TextInput placeholder="Search" />
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('Search');
            // 그룹은 시각만 켠다 — 자식은 개발자가 직접 지정하지 않는 한 건드리지 않는다.
            expect(input).not.toBeDisabled();
            expect(input).not.toHaveAttribute('aria-invalid');
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
                        <TextInput placeholder="Search" />
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
                        <TextInput placeholder="Search" />
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
