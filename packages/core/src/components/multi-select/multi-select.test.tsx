import { useState } from 'react';

import { cleanup, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { MultiSelect } from '.';
import { Field } from '../field';

describe('MultiSelect', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const rendered = render(<MultiSelectTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should open the popup when the trigger is clicked', async () => {
        const rendered = render(<MultiSelectTest />);
        const trigger = rendered.getByRole('combobox');

        await userEvent.click(trigger);

        const popup = rendered.getByRole('listbox');
        expect(popup).toBeInTheDocument();
    });

    it('should not close the popup when an item is selected', async () => {
        const rendered = render(<MultiSelectTest />);
        const trigger = rendered.getByRole('combobox');

        await userEvent.click(trigger);
        const appleItem = rendered.getByRole('option', { name: 'Apple' });
        await userEvent.click(appleItem);

        const popup = rendered.getByRole('listbox');
        expect(popup).toBeInTheDocument();
    });

    it('should allow multiple items to be selected', async () => {
        const rendered = render(<MultiSelectTest />);
        const trigger = rendered.getByRole('combobox');

        await userEvent.click(trigger);
        const appleItem = rendered.getByRole('option', { name: 'Apple' });
        const bananaItem = rendered.getByRole('option', { name: 'Banana' });

        await userEvent.click(appleItem);
        await userEvent.click(bananaItem);
        await userEvent.keyboard('[Escape]');

        const appleBadge = rendered.getByText('Apple');
        const bananaBadge = rendered.getByText('Banana');

        expect(appleBadge).toBeInTheDocument();
        expect(bananaBadge).toBeInTheDocument();
    });

    it('should set the correct value in the hidden input when multiple items are selected', async () => {
        const rendered = render(<MultiSelectTest defaultOpen />);

        const appleItem = rendered.getByRole('option', { name: 'Apple' });
        const bananaItem = rendered.getByRole('option', { name: 'Banana' });

        await userEvent.click(appleItem);
        await userEvent.click(bananaItem);
        await userEvent.keyboard('[Escape]');

        const trigger = rendered.getByRole('combobox');
        const hiddenInput = trigger.nextElementSibling as HTMLInputElement;

        expect(hiddenInput).toHaveValue('["apple","banana"]');
    });

    describe('ARIA attributes', () => {
        it('should have `aria-expanded="false"` when closed', () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).toHaveAttribute('aria-expanded', 'false');
        });

        it('should have `aria-expanded="true"` when open', async () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);

            expect(trigger).toHaveAttribute('aria-expanded', 'true');
        });

        it('should have items with `role="option"` in the listbox', async () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);

            const items = rendered.getAllByRole('option');
            expect(items).toHaveLength(3);
        });
    });

    describe('keyboard navigation', () => {
        it('should open the popup when Space is pressed on the trigger', async () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            await waitFor(() => trigger.focus());
            await userEvent.keyboard('[Space]');

            const popup = rendered.getByRole('listbox');
            expect(popup).toBeInTheDocument();
        });

        it('should open the popup when Enter is pressed on the trigger', async () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            await waitFor(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const popup = rendered.getByRole('listbox');
            expect(popup).toBeInTheDocument();
        });

        it('should close the popup when Escape is pressed', async () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const openPopup = rendered.getByRole('listbox');
            expect(openPopup).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');

            const closedPopup = rendered.queryByRole('listbox');
            expect(closedPopup).not.toBeInTheDocument();
        });
    });

    describe('prop: placeholder', () => {
        it('should display the placeholder when no value is selected', () => {
            const rendered = render(<MultiSelectTest />);

            const placeholder = rendered.getByText(PLACEHOLDER_TEXT);
            expect(placeholder).toBeInTheDocument();
        });

        it('should hide the placeholder after a value is selected', async () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const appleItem = rendered.getByRole('option', { name: 'Apple' });
            await userEvent.click(appleItem);

            const placeholder = rendered.queryByText(PLACEHOLDER_TEXT);
            expect(placeholder).not.toBeInTheDocument();
        });
    });

    describe('prop: items (array)', () => {
        it('should display the item label as a badge when a value is pre-selected', () => {
            const rendered = render(
                <MultiSelectTest items={ITEMS_ARRAY} defaultValue={['apple']} />,
            );

            const appleBadge = rendered.getByText('Apple');
            expect(appleBadge).toBeInTheDocument();
        });

        it('should display badges for all pre-selected values', () => {
            const rendered = render(
                <MultiSelectTest items={ITEMS_ARRAY} defaultValue={['apple', 'banana']} />,
            );

            const appleBadge = rendered.getByText('Apple');
            const bananaBadge = rendered.getByText('Banana');
            expect(appleBadge).toBeInTheDocument();
            expect(bananaBadge).toBeInTheDocument();
        });
    });

    describe('prop: items (record)', () => {
        it('should display the item label as a badge from the items record', () => {
            const rendered = render(
                <MultiSelectTest items={ITEMS_RECORD} defaultValue={['cherry']} />,
            );

            const cherryBadge = rendered.getByText('Cherry');
            expect(cherryBadge).toBeInTheDocument();
        });
    });

    describe('prop: onValueChange', () => {
        it('should invoke onValueChange with an array containing the selected value', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<MultiSelectTest onValueChange={onValueChange} />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const cherryItem = rendered.getByRole('option', { name: 'Cherry' });
            await userEvent.click(cherryItem);

            expect(onValueChange).toHaveBeenCalledWith(['cherry'], expect.anything());
        });

        it('should invoke onValueChange with all selected values when multiple items are selected', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <MultiSelectTest defaultValue={['apple']} onValueChange={onValueChange} />,
            );
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const bananaItem = rendered.getByRole('option', { name: 'Banana' });
            await userEvent.click(bananaItem);

            expect(onValueChange).toHaveBeenCalledWith(['apple', 'banana'], expect.anything());
        });
    });

    describe('prop: required', () => {
        it('should have the `aria-required` attribute on the trigger', () => {
            const rendered = render(<MultiSelectTest required />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).toHaveAttribute('aria-required', 'true');
        });

        it('should not have the `aria-required` attribute when required is not set', () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).not.toHaveAttribute('aria-required');
        });
    });

    describe('prop: invalid', () => {
        it('should have the `aria-invalid` attribute on the trigger', () => {
            const rendered = render(<MultiSelectTest invalid />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).toHaveAttribute('aria-invalid', 'true');
        });

        it('should not have the `aria-invalid` attribute when invalid is not set', () => {
            const rendered = render(<MultiSelectTest />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).not.toHaveAttribute('aria-invalid');
        });
    });

    describe('prop: disabled', () => {
        it('should have the `data-disabled` attribute on the trigger', () => {
            const rendered = render(<MultiSelectTest disabled />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).toHaveAttribute('data-disabled');
        });

        it('should not open the popup when clicked', async () => {
            const rendered = render(<MultiSelectTest disabled />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);

            const popup = rendered.queryByRole('listbox');
            expect(popup).not.toBeInTheDocument();
        });
    });

    describe('prop: readOnly', () => {
        it('should not invoke onValueChange when an item is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<MultiSelectTest readOnly onValueChange={onValueChange} />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const appleItem = rendered.queryByRole('option', { name: 'Apple' });

            if (appleItem) {
                await userEvent.click(appleItem);
            }

            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe('given a controlled MultiSelect', () => {
        it('should display the controlled values as badges', () => {
            const rendered = render(<ControlledMultiSelectTest value={['cherry']} />);

            const cherryBadge = rendered.getByText('Cherry');
            expect(cherryBadge).toBeInTheDocument();
        });

        it('should invoke onValueChange when a new item is selected', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <ControlledMultiSelectTest value={['apple']} onValueChange={onValueChange} />,
            );
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const bananaItem = rendered.getByRole('option', { name: 'Banana' });
            await userEvent.click(bananaItem);

            expect(onValueChange).toHaveBeenCalledWith(['apple', 'banana'], expect.anything());
        });
    });
});

const PLACEHOLDER_TEXT = 'Select options';

const ITEMS_ARRAY = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
];

const ITEMS_RECORD: Record<string, string> = {
    apple: 'Apple',
    banana: 'Banana',
    cherry: 'Cherry',
};

const MultiSelectTest = (props: MultiSelect.Root.Props) => (
    <Field.Root>
        <Field.Label>Fruit</Field.Label>
        <MultiSelect.Root placeholder={PLACEHOLDER_TEXT} {...props}>
            <MultiSelect.Trigger />
            <MultiSelect.Popup>
                <MultiSelect.Item value="apple">Apple</MultiSelect.Item>
                <MultiSelect.Item value="banana">Banana</MultiSelect.Item>
                <MultiSelect.Item value="cherry">Cherry</MultiSelect.Item>
            </MultiSelect.Popup>
        </MultiSelect.Root>
    </Field.Root>
);

const ControlledMultiSelectTest = ({
    value: valueProp,
    onValueChange,
    ...props
}: MultiSelect.Root.Props) => {
    const [value, setValue] = useState(valueProp ?? []);

    const handleValueChange = (
        newValue: unknown[],
        details: MultiSelect.Root.ChangeEventDetails,
    ) => {
        onValueChange?.(newValue, details);
        setValue(newValue);
    };

    return (
        <Field.Root>
            <Field.Label>Fruit</Field.Label>
            <MultiSelect.Root
                value={value}
                onValueChange={handleValueChange}
                items={ITEMS_RECORD}
                placeholder={PLACEHOLDER_TEXT}
                {...props}
            >
                <MultiSelect.Trigger />
                <MultiSelect.Popup>
                    <MultiSelect.Item value="apple">Apple</MultiSelect.Item>
                    <MultiSelect.Item value="banana">Banana</MultiSelect.Item>
                    <MultiSelect.Item value="cherry">Cherry</MultiSelect.Item>
                </MultiSelect.Popup>
            </MultiSelect.Root>
        </Field.Root>
    );
};
