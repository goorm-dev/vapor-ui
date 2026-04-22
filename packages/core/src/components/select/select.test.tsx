import { useState } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Select } from '.';
import { Field } from '../field';

describe('Select', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const rendered = render(<SelectTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should open the popup when the trigger is clicked', async () => {
        const rendered = render(<SelectTest />);
        const trigger = rendered.getByRole('combobox');

        await userEvent.click(trigger);

        const popup = rendered.getByRole('listbox');
        expect(popup).toBeInTheDocument();
    });

    it('should close the popup when an item is selected', async () => {
        const rendered = render(<SelectTest />);
        const trigger = rendered.getByRole('combobox');

        await userEvent.click(trigger);
        const appleItem = rendered.getByRole('option', { name: 'Apple' });
        await userEvent.click(appleItem);

        const listbox = rendered.queryByRole('listbox');
        expect(listbox).not.toBeInTheDocument();
    });

    it('should display the selected item label after selection', async () => {
        const rendered = render(<SelectTest />);
        const trigger = rendered.getByRole('combobox');

        await userEvent.click(trigger);
        const bananaItem = rendered.getByRole('option', { name: 'Banana' });
        await userEvent.click(bananaItem);

        const bananaLabel = rendered.getByText('Banana');
        expect(bananaLabel).toBeInTheDocument();
    });

    describe('ARIA attributes', () => {
        it('should have aria-expanded="false" when closed', () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).toHaveAttribute('aria-expanded', 'false');
        });

        it('should have aria-expanded="true" when open', async () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);

            expect(trigger).toHaveAttribute('aria-expanded', 'true');
        });

        it('should have options with role="option" in the listbox', async () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);

            const options = rendered.getAllByRole('option');
            expect(options).toHaveLength(3);
        });
    });

    describe('keyboard navigation', () => {
        it('should open the popup when Space is pressed on the trigger', async () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            trigger.focus();
            await userEvent.keyboard('[Space]');

            const popup = rendered.getByRole('listbox');
            expect(popup).toBeInTheDocument();
        });

        it('should open the popup when Enter is pressed on the trigger', async () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            trigger.focus();
            await userEvent.keyboard('[Enter]');

            const popup = rendered.getByRole('listbox');
            expect(popup).toBeInTheDocument();
        });

        it('should close the popup when Escape is pressed', async () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const openPopup = rendered.getByRole('listbox');
            expect(openPopup).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');

            const closedPopup = rendered.queryByRole('listbox');
            expect(closedPopup).not.toBeInTheDocument();
        });

        it('should navigate options with ArrowDown key', async () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            trigger.focus();
            await userEvent.keyboard('[Space]');
            await userEvent.keyboard('[ArrowDown]');

            const bananaItem = rendered.getByRole('option', { name: 'Banana' });
            expect(bananaItem).toHaveAttribute('data-highlighted');
        });
    });

    describe('prop: placeholder', () => {
        it('should display the placeholder when no value is selected', () => {
            const rendered = render(<SelectTest />);

            const placeholder = rendered.getByText(PLACEHOLDER_TEXT);
            expect(placeholder).toBeInTheDocument();
        });

        it('should hide the placeholder after a value is selected', async () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const appleItem = rendered.getByRole('option', { name: 'Apple' });
            await userEvent.click(appleItem);

            const placeholder = rendered.queryByText(PLACEHOLDER_TEXT);
            expect(placeholder).not.toBeInTheDocument();
        });
    });

    describe('prop: items (array)', () => {
        it('should display the item label from the items array as the selected value', async () => {
            const rendered = render(<SelectTest items={ITEMS_ARRAY} defaultValue="apple" />);

            const appleLabel = rendered.getByText('Apple');
            expect(appleLabel).toBeInTheDocument();
        });

        it('should update the displayed label when a new item is selected', async () => {
            const rendered = render(<SelectTest items={ITEMS_ARRAY} />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const cherryOption = rendered.getByRole('option', { name: 'Cherry' });
            await userEvent.click(cherryOption);

            // expect(rendered.getByText('Cherry')).toBeInTheDocument();
            expect(trigger).toHaveTextContent('Cherry');
        });
    });

    describe('prop: items (record)', () => {
        it('should display the item label from the items record as the selected value', async () => {
            const rendered = render(<SelectTest items={ITEMS_RECORD} defaultValue="banana" />);

            const bananaLabel = rendered.getByText('Banana');
            expect(bananaLabel).toBeInTheDocument();
        });
    });

    describe('prop: onValueChange', () => {
        it('should invoke onValueChange with the selected value when an item is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<SelectTest onValueChange={onValueChange} />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const cherryOption = rendered.getByRole('option', { name: 'Cherry' });
            await userEvent.click(cherryOption);

            expect(onValueChange).toHaveBeenCalledWith('cherry', expect.anything());
        });
    });

    describe('prop: required', () => {
        it('should have the aria-required attribute on the trigger', () => {
            const rendered = render(<SelectTest required />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).toHaveAttribute('aria-required', 'true');
        });

        it('should not have the aria-required attribute when required is not set', () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).not.toHaveAttribute('aria-required');
        });
    });

    describe('prop: invalid', () => {
        it('should have the aria-invalid attribute on the trigger', () => {
            const rendered = render(<SelectTest invalid />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).toHaveAttribute('aria-invalid', 'true');
        });

        it('should not have the aria-invalid attribute when invalid is not set', () => {
            const rendered = render(<SelectTest />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).not.toHaveAttribute('aria-invalid');
        });
    });

    describe('prop: disabled', () => {
        it('should have the data-disabled attribute on the trigger', () => {
            const rendered = render(<SelectTest disabled />);
            const trigger = rendered.getByRole('combobox');

            expect(trigger).toHaveAttribute('data-disabled');
        });

        it('should not open the popup when clicked', async () => {
            const rendered = render(<SelectTest disabled />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);

            const listbox = rendered.queryByRole('listbox');
            expect(listbox).not.toBeInTheDocument();
        });
    });

    describe('prop: readOnly', () => {
        it('should not change the selected value when an item is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<SelectTest readOnly onValueChange={onValueChange} />);
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const appleItem = rendered.queryByRole('option', { name: 'Apple' });

            if (appleItem) {
                await userEvent.click(appleItem);
            }

            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe('given a controlled Select', () => {
        it('should display the controlled value', () => {
            const rendered = render(<ControlledSelectTest value="cherry" />);

            const cherryLabel = rendered.getByText('Cherry');
            expect(cherryLabel).toBeInTheDocument();
        });

        it('should invoke onValueChange when a new item is selected', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <ControlledSelectTest value="apple" onValueChange={onValueChange} />,
            );
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            const bananaItem = rendered.getByRole('option', { name: 'Banana' });
            await userEvent.click(bananaItem);

            expect(onValueChange).toHaveBeenCalledWith('banana', expect.anything());
        });
    });
});

const PLACEHOLDER_TEXT = 'Select an option';

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

const SelectTest = (props: Select.Root.Props) => (
    <Field.Root>
        <Field.Label>Fruit</Field.Label>
        <Select.Root placeholder={PLACEHOLDER_TEXT} {...props}>
            <Select.Trigger />
            <Select.Popup>
                <Select.Item value="apple">Apple</Select.Item>
                <Select.Item value="banana">Banana</Select.Item>
                <Select.Item value="cherry">Cherry</Select.Item>
            </Select.Popup>
        </Select.Root>
    </Field.Root>
);

const ControlledSelectTest = ({ value: valueProp, onValueChange, ...props }: Select.Root.Props) => {
    const [value, setValue] = useState(valueProp);

    const handleValueChange = (newValue: unknown, details: Select.Root.ChangeEventDetails) => {
        onValueChange?.(newValue, details);
        setValue(newValue);
    };

    return (
        <Select.Root
            value={value}
            onValueChange={handleValueChange}
            items={ITEMS_RECORD}
            placeholder={PLACEHOLDER_TEXT}
            {...props}
        >
            <Select.Trigger />

            <Select.Popup>
                <Select.Item value="apple">Apple</Select.Item>
                <Select.Item value="banana">Banana</Select.Item>
                <Select.Item value="cherry">Cherry</Select.Item>
            </Select.Popup>
        </Select.Root>
    );
};
