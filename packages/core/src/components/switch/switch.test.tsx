import { useState } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Switch } from '.';
import { Field } from '../field';

describe('Switch', () => {
    afterEach(cleanup);

    describe('given a default Switch', () => {
        it('should have no a11y violations', async () => {
            const rendered = render(<SwitchTest />);
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should associate the label with the switch control', async () => {
            const rendered = render(<SwitchTest />);
            const control = rendered.getByRole('switch');
            const label = rendered.getByText(LABEL_TEXT);

            await userEvent.click(label);

            expect(control).toHaveFocus();
        });

        it('should toggle checked state when clicked', async () => {
            const rendered = render(<SwitchTest />);
            const control = rendered.getByRole('switch');

            expect(control).not.toBeChecked();

            await userEvent.click(control);
            expect(control).toBeChecked();

            await userEvent.click(control);
            expect(control).not.toBeChecked();
        });

        it('should toggle checked state when label is clicked', async () => {
            const rendered = render(<SwitchTest />);
            const control = rendered.getByRole('switch');
            const label = rendered.getByText(LABEL_TEXT);

            expect(control).not.toBeChecked();

            await userEvent.click(label);
            expect(control).toBeChecked();

            await userEvent.click(label);
            expect(control).not.toBeChecked();
        });
    });

    describe('given a uncontrolled Switch', () => {
        const onCheckedChange = vi.fn();

        beforeEach(() => {
            onCheckedChange.mockClear();
        });

        it('should have no a11y violations', async () => {
            const rendered = render(
                <SwitchTest defaultChecked onCheckedChange={onCheckedChange} />,
            );
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should invoke onCheckedChange callback when toggled', async () => {
            const rendered = render(
                <SwitchTest defaultChecked onCheckedChange={onCheckedChange} />,
            );
            const control = rendered.getByRole('switch');

            expect(onCheckedChange).not.toHaveBeenCalled();

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(1);

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(2);
        });

        it('should toggle checked state when clicked', async () => {
            const rendered = render(
                <SwitchTest defaultChecked onCheckedChange={onCheckedChange} />,
            );
            const control = rendered.getByRole('switch');

            expect(control).toBeChecked();

            await userEvent.click(control);
            expect(control).not.toBeChecked();

            await userEvent.click(control);
            expect(control).toBeChecked();
        });
    });

    describe('given a controlled Switch', () => {
        it('should have no a11y violations', async () => {
            const onCheckedChange = vi.fn();

            const rendered = render(<SwitchTest onCheckedChange={onCheckedChange} />);
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should toggle checked state when clicked', async () => {
            const onCheckedChange = vi.fn();

            const rendered = render(<SwitchTest onCheckedChange={onCheckedChange} />);
            const control = rendered.getByRole('switch');

            expect(control).not.toBeChecked();

            await userEvent.click(control);
            expect(control).toBeChecked();

            await userEvent.click(control);
            expect(control).not.toBeChecked();
        });

        it('should invoke onCheckedChange callback when clicked', async () => {
            const onCheckedChange = vi.fn();

            const rendered = render(<SwitchTest onCheckedChange={onCheckedChange} />);
            const control = rendered.getByRole('switch');

            expect(onCheckedChange).not.toHaveBeenCalled();

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(1);
            expect(onCheckedChange).toHaveBeenCalledWith(
                true,
                expect.objectContaining({
                    reason: expect.any(String),
                    event: expect.any(Event),
                }),
            );

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(2);
            expect(onCheckedChange).toHaveBeenCalledWith(
                false,
                expect.objectContaining({
                    reason: expect.any(String),
                    event: expect.any(Event),
                }),
            );
        });

        it('should not toggle checked state when blocker is active', async () => {
            const onCheckedChange = vi.fn();

            const rendered = render(<ControlledSwitchTest onCheckedChange={onCheckedChange} />);
            const control = rendered.getByRole('switch');
            const blockerButton = rendered.getByText('Blocker Controller');

            expect(control).not.toBeChecked();

            await userEvent.click(blockerButton);
            await userEvent.click(control);

            expect(onCheckedChange).toHaveBeenCalled();
            expect(control).not.toBeChecked();

            await userEvent.click(blockerButton);
            await userEvent.click(control);

            expect(onCheckedChange).toHaveBeenCalled();
            expect(control).toBeChecked();
        });
    });

    describe('prop: disabled', () => {
        it('should have the `aria-disabled` attribute', async () => {
            const rendered = render(<SwitchTest disabled />);
            const control = rendered.getByRole('switch');

            expect(control).toHaveAttribute('aria-disabled', 'true');
        });

        it('should not have the `aria-disabled` attribute when `disabled` is not set', async () => {
            const rendered = render(<SwitchTest />);
            const control = rendered.getByRole('switch');

            expect(control).not.toHaveAttribute('aria-disabled');
        });

        it('should not change its state when clicked', async () => {
            const onCheckedChange = vi.fn();
            const rendered = render(<SwitchTest disabled onCheckedChange={onCheckedChange} />);
            const control = rendered.getByRole('switch');

            expect(control).toHaveAttribute('aria-disabled', 'true');

            await userEvent.click(control);
            expect(onCheckedChange).not.toHaveBeenCalled();
            expect(control).not.toBeChecked();
        });

        it('should not focusable', async () => {
            const rendered = render(<SwitchTest disabled />);
            const control = rendered.getByRole('switch');

            expect(control).not.toHaveFocus();

            await userEvent.tab();
            expect(control).not.toHaveFocus();
        });
    });

    describe('prop: invalid', () => {
        it('should have the `aria-invalid` attribute', async () => {
            const rendered = render(<SwitchTest invalid />);

            expect(rendered.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
        });

        it('should not have the `aria-invalid` attribute when `invalid` is not set', async () => {
            const rendered = render(<SwitchTest />);

            expect(rendered.getByRole('switch')).not.toHaveAttribute('aria-invalid');
        });

        it('should not clobber `aria-invalid` computed by Field validation', async () => {
            const rendered = render(
                <Field.Root name="notify" validationMode="onBlur" validate={() => 'Required'}>
                    <Switch.Root aria-label={LABEL_TEXT} invalid={false} />
                    <Field.Error>Required</Field.Error>
                </Field.Root>,
            );
            const control = rendered.getByRole('switch');

            await userEvent.click(control);
            await userEvent.tab();

            expect(control).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('prop: required', () => {
        it('should have the `aria-required` attribute', async () => {
            const rendered = render(<SwitchTest required />);

            expect(rendered.getByRole('switch')).toHaveAttribute('aria-required', 'true');
        });

        it('should not have the `aria-required` attribute when `required` is not set', async () => {
            const rendered = render(<SwitchTest />);

            expect(rendered.getByRole('switch')).not.toHaveAttribute('aria-required');
        });
    });
});

const LABEL_TEXT = 'Test Switch';

const SwitchTest = (props: Switch.Root.Props) => (
    <>
        <Switch.Root id="switch-test" aria-label={LABEL_TEXT} {...props} />
        <label htmlFor="switch-test">{LABEL_TEXT}</label>
    </>
);

const ControlledSwitchTest = ({ onCheckedChange, ...props }: Switch.Root.Props) => {
    const [checked, setChecked] = useState<boolean>(false);
    const [blocker, setBlocker] = useState<boolean>(false);

    const handleCheckedChange = (checked: boolean, event: Switch.Root.ChangeEventDetails) => {
        onCheckedChange?.(checked, event);

        if (blocker) return;
        setChecked(checked);
    };

    return (
        <>
            <Switch.Root
                id="switch-test"
                checked={checked}
                onCheckedChange={handleCheckedChange}
                {...props}
            />
            <label htmlFor="switch-test">{LABEL_TEXT}</label>

            <button onClick={() => setBlocker((prev) => !prev)}>Blocker Controller</button>
        </>
    );
};
