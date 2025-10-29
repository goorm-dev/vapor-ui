import { useState } from 'react';

import type { RenderResult } from '@testing-library/react';
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Checkbox } from '.';

describe('Checkbox', () => {
    afterEach(cleanup);

    describe('given a default Checkbox', () => {
        let rendered: RenderResult;
        let checkbox: HTMLElement;

        beforeEach(() => {
            rendered = render(<CheckboxTest />);
            checkbox = rendered.getByRole('checkbox') as HTMLElement;
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should associate the label with the input field', async () => {
            const label = rendered.getByText(LABEL_TEXT);

            await userEvent.click(label);

            expect(checkbox).toHaveFocus();
        });

        it('should toggle checked state when clicked', async () => {
            let icon;

            expect(checkbox).not.toBeChecked();

            await userEvent.click(checkbox);
            icon = checkbox.querySelector('svg');
            expect(checkbox).toBeChecked();
            expect(icon).toBeInTheDocument();

            await userEvent.click(checkbox);
            icon = checkbox.querySelector('svg');
            expect(checkbox).not.toBeChecked();
            expect(icon).not.toBeInTheDocument();
        });

        it('should toggle checked state when label is clicked', async () => {
            const label = rendered.getByText(LABEL_TEXT);
            expect(checkbox).not.toBeChecked();

            await userEvent.click(label);
            expect(checkbox).toBeChecked();

            await userEvent.click(label);
            expect(checkbox).not.toBeChecked();
        });
    });

    describe('ARIA attributes', () => {
        it('should have the `role` attribute set to "checkbox"', () => {
            const rendered = render(<CheckboxTest />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toHaveAttribute('role', 'checkbox');
        });

        it('should have the `aria-checked` attribute', async () => {
            const rendered = render(<CheckboxTest />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toHaveAttribute('aria-checked', 'false');

            await userEvent.click(checkbox);
            expect(checkbox).toHaveAttribute('aria-checked', 'true');
        });
    });

    describe('given a uncontrolled Checkbox', () => {
        const onCheckedChange = vi.fn();
        let rendered: RenderResult;
        let checkbox: HTMLElement;

        beforeEach(() => {
            rendered = render(<CheckboxTest defaultChecked onCheckedChange={onCheckedChange} />);
            checkbox = rendered.getByRole('checkbox') as HTMLElement;
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should toggle checked state when clicked', async () => {
            let icon;

            expect(checkbox).toBeChecked();

            await userEvent.click(checkbox);
            icon = checkbox.querySelector('svg');
            expect(checkbox).not.toBeChecked();
            expect(icon).not.toBeInTheDocument();

            await userEvent.click(checkbox);
            icon = checkbox.querySelector('svg');
            expect(checkbox).toBeChecked();
            expect(icon).toBeInTheDocument();
        });

        it('should invoke onCheckedChange when the checkbox is clicked', async () => {
            await userEvent.click(checkbox);
            expect(onCheckedChange).toHaveBeenCalled();
        });
    });

    describe('given a controlled Checkbox', () => {
        const onCheckedChange = vi.fn();
        let rendered: RenderResult;
        let checkbox: HTMLElement;

        beforeEach(() => {
            rendered = render(<ControlledCheckboxTest onCheckedChange={onCheckedChange} />);
            checkbox = rendered.getByRole('checkbox');
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should toggle checked state when clicked', async () => {
            let icon;

            expect(checkbox).not.toBeChecked();

            await userEvent.click(checkbox);
            icon = checkbox.querySelector('svg');
            expect(checkbox).toBeChecked();
            expect(icon).toBeInTheDocument();

            await userEvent.click(checkbox);
            icon = checkbox.querySelector('svg');
            expect(checkbox).not.toBeChecked();
            expect(icon).not.toBeInTheDocument();
        });

        it('should invoke onCheckedChange when the checkbox is clicked', async () => {
            await userEvent.click(checkbox);
            expect(onCheckedChange).toHaveBeenCalled();
        });

        it('should not toggle checked state when blocker is active', async () => {
            expect(checkbox).not.toBeChecked();

            const blockerButton = rendered.getByText('Blocker Controller');

            await userEvent.click(blockerButton);
            await userEvent.click(checkbox);
            expect(onCheckedChange).toHaveBeenCalled();
            expect(checkbox).not.toBeChecked();

            await userEvent.click(blockerButton);
            await userEvent.click(checkbox);
            expect(onCheckedChange).toHaveBeenCalled();
            expect(checkbox).toBeChecked();
        });
    });

    describe('prop: invalid', () => {
        it('should have the `aria-invalid` attribute', async () => {
            const rendered = render(<CheckboxTest invalid />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toHaveAttribute('aria-invalid', 'true');
        });

        it('should not have the `aria-invalid` attribute when `invalid` is not set', async () => {
            const rendered = render(<CheckboxTest />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).not.toHaveAttribute('aria-invalid');
        });
    });

    describe('prop: indeterminate', () => {
        it('should set the `aria-checked` attribute as "mixed"', async () => {
            const rendered = render(<CheckboxTest indeterminate />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
        });

        it('should not change its state when clicked', async () => {
            const rendered = render(<CheckboxTest indeterminate />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

            await userEvent.click(checkbox);

            expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
        });

        it('should not have the aria attribute when `indeterminate` is not set', async () => {
            const rendered = render(<CheckboxTest />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).not.toHaveAttribute('aria-checked', 'mixed');
        });

        it('should not be overridden by `checked` prop', async () => {
            const rendered = render(<CheckboxTest indeterminate checked />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
        });
    });

    describe('prop: disabled', () => {
        it('should have the `disabled` attribute', async () => {
            const rendered = render(<CheckboxTest disabled />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toHaveAttribute('disabled');
        });

        it('should not have the `disabled` attribute when `disabled` is not set', async () => {
            const rendered = render(<CheckboxTest />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).not.toHaveAttribute('disabled');
        });

        it('should not change its state when clicked', async () => {
            const onCheckedChange = vi.fn();
            const rendered = render(<CheckboxTest disabled onCheckedChange={onCheckedChange} />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toBeDisabled();

            await userEvent.click(checkbox);
            expect(onCheckedChange).not.toHaveBeenCalled();
            expect(checkbox).not.toBeChecked();
        });
    });
});

const LABEL_TEXT = 'Checkbox Label';

const CheckboxTest = (props: Checkbox.Root.Props) => (
    <>
        <Checkbox.Root id="checkbox" {...props} />
        <label htmlFor="checkbox">{LABEL_TEXT}</label>
    </>
);

const ControlledCheckboxTest = (props: Checkbox.Root.Props) => {
    const [checkbox, setCheckbox] = useState<boolean>(false);
    const [blocker, setBlocker] = useState<boolean>(false);

    const handleCheckedChange = (checked: boolean, event: Event) => {
        props.onCheckedChange?.(checked, event);

        if (blocker) return;
        setCheckbox(checked);
    };

    return (
        <div>
            <Checkbox.Root id="checkbox" checked={checkbox} onCheckedChange={handleCheckedChange} />
            <label htmlFor="checkbox">{LABEL_TEXT}</label>

            <button onClick={() => setBlocker((prev) => !prev)}>Blocker Controller</button>
        </div>
    );
};
