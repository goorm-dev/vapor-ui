import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { InputGroup } from '.';
import { Field } from '../field';
import { Select } from '../select';
import { VALUE_DISABLED } from './input-group.css';

/**
 * 이 스위트는 jsdom 레이어의 책임만 검증한다 — 접근성, DOM 속성(data-*, aria-invalid, :disabled),
 * disabled 의 래퍼 전파, 그리고 시각 앵커 셀렉터가 무엇에 매칭되는지. 실제 픽셀(테두리 색·감광
 * 정도·focus 링)은 Storybook/Playwright 담당.
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

        it('should NOT own readOnly — it is the value control that does', () => {
            render(
                <InputGroup.Root data-testid="group">
                    <InputGroup.Input placeholder="amount" readOnly />
                </InputGroup.Root>,
            );

            expect(screen.getByTestId('group')).not.toHaveAttribute('data-readonly');
            expect(screen.getByPlaceholderText('amount')).toHaveAttribute('data-readonly');
        });

        it('should NOT set data-disabled when the prop is falsy', () => {
            render(<InputGroup.Root data-testid="group" />);
            expect(screen.getByTestId('group')).not.toHaveAttribute('data-disabled');
        });
    });

    /**
     * disabled 시각은 세 앵커가 켠다: Root 자기 prop, 값 컨트롤의 :disabled, 편입 Select 트리거의
     * :disabled. 값을 담지 않는 보조 버튼(clear·copy)의 disabled 는 그룹을 감광시키면 안 된다 —
     * "값이 비어서 clear 를 껐다"는 가장 흔한 패턴이라 오탐이면 입력창까지 흐려진다.
     */
    describe('disabled visual anchors', () => {
        // 스타일이 실제로 쓰는 셀렉터를 그대로 가져온다 — 복사해두면 앵커를 바꿔도 테스트가 통과한다.
        const matchesAnyAnchor = (el: HTMLElement) => VALUE_DISABLED.some((sel) => el.matches(sel));

        it('should NOT match the value anchors when only an auxiliary button is disabled', () => {
            render(
                <InputGroup.Root data-testid="group">
                    <InputGroup.Input placeholder="amount" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.IconButton aria-label="clear" disabled>
                            x
                        </InputGroup.IconButton>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            const group = screen.getByTestId('group');
            expect(group).not.toHaveAttribute('data-disabled');
            expect(matchesAnyAnchor(group)).toBe(false);
        });

        it('should NOT match the value anchors on a disabled option of a native select addon', () => {
            render(
                <InputGroup.Root data-testid="group">
                    <InputGroup.Input placeholder="amount" />
                    <InputGroup.TrailingAddon>
                        <select aria-label="currency" defaultValue="">
                            <option value="" disabled>
                                pick one
                            </option>
                            <option value="usd">usd</option>
                        </select>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            expect(matchesAnyAnchor(screen.getByTestId('group'))).toBe(false);
        });

        it('should match the value anchors when a wrapping Field disables the value control', () => {
            render(
                <Field.Root disabled>
                    <InputGroup.Root data-testid="group">
                        <InputGroup.Input placeholder="amount" />
                    </InputGroup.Root>
                </Field.Root>,
            );

            const group = screen.getByTestId('group');
            // Field 는 Root 에 prop 을 주지 않으므로 값 컨트롤 앵커가 유일한 감광 경로다.
            expect(group).not.toHaveAttribute('data-disabled');
            expect(matchesAnyAnchor(group)).toBe(true);
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

        it('should leave buttons interactive when the value control is readOnly', () => {
            render(
                <InputGroup.Root>
                    <InputGroup.Input placeholder="amount" readOnly />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button aria-label="copy">c</InputGroup.Button>
                        <InputGroup.IconButton aria-label="toggle">t</InputGroup.IconButton>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            const input = screen.getByPlaceholderText('amount');
            expect(input).toHaveAttribute('readonly');
            // data-readonly 가 곧 Root 의 :has([data-readonly]) 배경 시각의 앵커다.
            expect(input).toHaveAttribute('data-readonly');

            // 값을 바꾸지 않는 버튼(copy·password toggle)은 readOnly 에서 살아 있어야 한다.
            for (const name of ['copy', 'toggle']) {
                const button = screen.getByRole('button', { name });
                expect(button).not.toBeDisabled();
                expect(button).not.toHaveAttribute('readonly');
            }
        });

        it('should disable IconButton when the group is disabled', () => {
            render(
                <InputGroup.Root disabled>
                    <InputGroup.Input placeholder="amount" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.IconButton aria-label="clear">x</InputGroup.IconButton>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>,
            );

            expect(screen.getByRole('button', { name: 'clear' })).toBeDisabled();
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

    describe('readOnly visual anchor (:has([data-readonly]) source)', () => {
        // Root 의 readOnly 배경은 값 컨트롤의 data-readonly 를 :has() 로 관찰해 켠다.
        // Select 는 그룹으로 전파받지 않고 Select.Root 에 직접 readOnly 를 받으며, 그때 편입된
        // Trigger 가 data-readonly 를 방출해야 같은 셀렉터가 그룹 배경까지 커버한다.
        it('should emit data-readonly on the embedded Select trigger when Select.Root is readOnly', () => {
            render(
                <InputGroup.Root>
                    <Select.Root readOnly placeholder="Currency">
                        <InputGroup.Input placeholder="amount" />
                        <InputGroup.TrailingAddon>
                            <InputGroup.Button render={<Select.Trigger />} />
                        </InputGroup.TrailingAddon>
                    </Select.Root>
                </InputGroup.Root>,
            );

            expect(screen.getByRole('combobox')).toHaveAttribute('data-readonly');
        });
    });

    describe('composition', () => {
        it('should support the render prop on Root', () => {
            render(<InputGroup.Root data-testid="group" render={<section />} />);
            expect(screen.getByTestId('group').tagName).toBe('SECTION');
        });
    });
});
