import { useState } from 'react';

import type { RenderResult } from '@testing-library/react';
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import type { SwitchRootProps } from './switch';
import { Switch } from './switch';

describe('Switch', () => {
    afterEach(cleanup);

    describe('given a default Switch', () => {
        let rendered: RenderResult;
        let control: HTMLElement;
        let label: HTMLElement;

        beforeEach(() => {
            rendered = render(<SwitchTest />);
            control = rendered.getByRole('switch');
            label = rendered.getByText(LABEL_TEXT);
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should associate the label with the switch control', async () => {
            const label = rendered.getByLabelText(LABEL_TEXT);

            await userEvent.click(label);

            expect(control).toHaveFocus();
        });

        it('should toggle checked state when clicked', async () => {
            expect(control).not.toBeChecked();

            await userEvent.click(control);
            expect(control).toBeChecked();

            await userEvent.click(control);
            expect(control).not.toBeChecked();
        });

        it('should toggle checked state when label is clicked', async () => {
            expect(control).not.toBeChecked();

            await userEvent.click(label);
            expect(control).toBeChecked();

            await userEvent.click(label);
            expect(control).not.toBeChecked();
        });
    });

    describe('given a uncontrolled Switch', () => {
        const onCheckedChange = vi.fn();
        let rendered: RenderResult;
        let control: HTMLElement;

        beforeEach(() => {
            rendered = render(<SwitchTest defaultChecked onCheckedChange={onCheckedChange} />);
            control = rendered.getByRole('switch') as HTMLElement;

            onCheckedChange.mockClear();
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should invoke onCheckedChange callback when toggled', async () => {
            expect(onCheckedChange).not.toHaveBeenCalled();

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(1);

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(2);
        });

        it('should toggle checked state when clicked', async () => {
            expect(control).toBeChecked();

            await userEvent.click(control);
            expect(control).not.toBeChecked();

            await userEvent.click(control);
            expect(control).toBeChecked();
        });
    });

    describe('given a controlled Switch', () => {
        const onCheckedChange = vi.fn();
        let rendered: RenderResult;
        let control: HTMLElement;

        beforeEach(() => {
            rendered = render(<ControlledSwitchTest onCheckedChange={onCheckedChange} />);
            control = rendered.getByRole('switch') as HTMLElement;

            onCheckedChange.mockClear();
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should toggle checked state when clicked', async () => {
            expect(control).not.toBeChecked();

            await userEvent.click(control);
            expect(control).toBeChecked();

            await userEvent.click(control);
            expect(control).not.toBeChecked();
        });

        it('should invoke onCheckedChange callback when clicked', async () => {
            expect(onCheckedChange).not.toHaveBeenCalled();

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(1);

            await userEvent.click(control);
            expect(onCheckedChange).toHaveBeenCalledTimes(2);
        });

        it('should not toggle checked state when blocker is active', async () => {
            expect(control).not.toBeChecked();

            const blockerButton = rendered.getByText('Blocker Controller');

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

const SwitchTest = (props: SwitchRootProps) => (
    <Switch.Root {...props}>
        <Switch.Control />
        {LABEL_TEXT}
    </Switch.Root>
);

const ControlledSwitchTest = (props: SwitchRootProps) => {
    const [checked, setChecked] = useState<boolean>(false);
    const [blocker, setBlocker] = useState<boolean>(false);

    const handleCheckedChange = (checked: boolean, event: Event) => {
        props.onCheckedChange?.(checked, event);

        if (blocker) return;
        setChecked(checked);
    };

    return (
        <>
            <Switch.Root {...props} checked={checked} onCheckedChange={handleCheckedChange}>
                <Switch.Control />
                {LABEL_TEXT}
            </Switch.Root>

            <button onClick={() => setBlocker((prev) => !prev)}>Blocker Controller</button>
        </>
    );
};
