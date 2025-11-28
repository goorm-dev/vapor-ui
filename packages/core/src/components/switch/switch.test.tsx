import { useState } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Switch } from '.';

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
            expect(onCheckedChange).toHaveBeenCalledWith(true, expect.any(Object));

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(2);
            expect(onCheckedChange).toHaveBeenCalledWith(false, expect.any(Object));
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
        it('should have the `disabled` attribute', async () => {
            const rendered = render(<SwitchTest disabled />);
            const control = rendered.getByRole('switch');

            expect(control).toHaveAttribute('disabled');
        });

        it('should not have the `disabled` attribute when `disabled` is not set', async () => {
            const rendered = render(<SwitchTest />);
            const control = rendered.getByRole('switch');

            expect(control).not.toHaveAttribute('disabled');
        });

        it('should not change its state when clicked', async () => {
            const onCheckedChange = vi.fn();
            const rendered = render(<SwitchTest disabled onCheckedChange={onCheckedChange} />);
            const control = rendered.getByRole('switch');

            expect(control).toBeDisabled();

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
});

const LABEL_TEXT = 'Test Switch';

const SwitchTest = (props: Switch.Root.Props) => (
    <>
        <Switch.Root id="switch-test" {...props} />
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
