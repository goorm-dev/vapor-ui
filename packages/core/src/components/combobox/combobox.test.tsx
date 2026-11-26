import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Combobox } from '.';
import { Field } from '../field';

const fruits = ['Apple', 'Banana', 'Cherry', 'Durian'];

const renderItem = (fruit: string) => (
    <Combobox.Item key={fruit} value={fruit}>
        {fruit}
    </Combobox.Item>
);

const TestCombobox = ({
    children = renderItem,
    ...props
}: Partial<Omit<Combobox.Root.Props<string>, 'children'>> & {
    children?: Combobox.Popup.Props['children'];
}) => (
    <Combobox.Root items={fruits} placeholder="Pick a fruit" aria-label="Fruit" {...props}>
        <Combobox.InputGroup data-testid="group" />
        <Combobox.Popup data-testid="popup">{children}</Combobox.Popup>
    </Combobox.Root>
);

const optionNames = () => screen.getAllByRole('option').map((option) => option.textContent);

// The popup is portaled out of `container`, so it is scanned on its own. Base UI's focus guards
// are aria-hidden spans with tabIndex 0 by design, so they are skipped.
const expectNoA11yViolations = async (container: Element) => {
    const parts = [...container.children].filter(
        (element) => !element.hasAttribute('data-base-ui-focus-guard'),
    );

    for (const element of parts) {
        expect(await axe(element, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    }
};

describe('Combobox', () => {
    afterEach(cleanup);

    describe('accessibility', () => {
        it('has no violations when labelled by Field.Label', async () => {
            const { container } = render(
                <Field.Root name="fruit">
                    <Field.Label>Fruit</Field.Label>
                    <Combobox.Root items={fruits} placeholder="Pick a fruit">
                        <Combobox.InputGroup />
                        <Combobox.Popup>
                            {(fruit: string) => (
                                <Combobox.Item key={fruit} value={fruit}>
                                    {fruit}
                                </Combobox.Item>
                            )}
                        </Combobox.Popup>
                    </Combobox.Root>
                </Field.Root>,
            );

            expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
            await expectNoA11yViolations(container);
        });

        it('has no violations when labelled by aria-label, with the popup open', async () => {
            const { container } = render(<TestCombobox defaultOpen />);

            expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
            await expectNoA11yViolations(container);
            expect(
                await axe(screen.getByTestId('popup'), { rules: { region: { enabled: false } } }),
            ).toHaveNoViolations();
        });

        it('names the input by aria-labelledby', () => {
            render(
                <>
                    <span id="label">Produce</span>
                    <TestCombobox aria-label={undefined} aria-labelledby="label" />
                </>,
            );

            expect(screen.getByRole('combobox', { name: 'Produce' })).toBeInTheDocument();
        });
    });

    describe('filtering and selection', () => {
        it('shows the placeholder while nothing is typed', () => {
            render(<TestCombobox />);

            expect(screen.getByPlaceholderText('Pick a fruit')).toBeInTheDocument();
        });

        it('filters the options by the typed text', async () => {
            render(<TestCombobox />);

            await userEvent.type(screen.getByRole('combobox'), 'an');

            expect(optionNames()).toEqual(['Banana', 'Durian']);
        });

        it('sets the value and the input text when an option is clicked', async () => {
            const onValueChange = vi.fn();
            render(<TestCombobox onValueChange={onValueChange} />);

            await userEvent.click(screen.getByRole('combobox'));
            await userEvent.click(screen.getByRole('option', { name: 'Cherry' }));

            expect(onValueChange).toHaveBeenLastCalledWith('Cherry', expect.anything());
            expect(screen.getByRole('combobox')).toHaveValue('Cherry');
            await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
        });

        it('shows Empty only when no option matches', async () => {
            render(
                <TestCombobox>
                    <Combobox.Empty>No results</Combobox.Empty>
                    {renderItem}
                </TestCombobox>,
            );
            const input = screen.getByRole('combobox');

            await userEvent.type(input, 'ch');
            expect(optionNames()).toEqual(['Cherry']);
            expect(screen.queryByText('No results')).not.toBeInTheDocument();

            await userEvent.type(input, 'zz');
            expect(screen.getByText('No results')).toBeInTheDocument();
            expect(screen.queryAllByRole('option')).toHaveLength(0);
        });
    });

    describe('empty', () => {
        it('renders no text while options match, and the message once none do', async () => {
            render(
                <TestCombobox>
                    <Combobox.Empty data-testid="empty">No results</Combobox.Empty>
                    {renderItem}
                </TestCombobox>,
            );
            const input = screen.getByRole('combobox');

            await userEvent.click(input);
            expect(screen.getByTestId('empty')).toBeEmptyDOMElement();

            await userEvent.type(input, 'zz');
            expect(screen.getByTestId('empty')).toHaveTextContent('No results');
        });
    });

    describe('groups', () => {
        const groups = [
            { value: 'Fruit', items: ['Apple', 'Banana'] },
            { value: 'Vegetable', items: ['Carrot', 'Daikon'] },
        ];

        it('filters the options inside each group', async () => {
            render(
                <Combobox.Root items={groups} aria-label="Produce">
                    <Combobox.InputGroup />
                    <Combobox.Popup>
                        {(group: (typeof groups)[number]) => (
                            <Combobox.Group key={group.value} items={group.items}>
                                <Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
                                {renderItem}
                            </Combobox.Group>
                        )}
                    </Combobox.Popup>
                </Combobox.Root>,
            );

            await userEvent.type(screen.getByRole('combobox'), 'a');

            expect(optionNames()).toEqual(['Apple', 'Banana', 'Carrot', 'Daikon']);

            await userEvent.type(screen.getByRole('combobox'), 'r');

            expect(optionNames()).toEqual(['Carrot']);
            expect(screen.getByText('Vegetable')).toBeInTheDocument();
            expect(screen.queryByText('Fruit')).not.toBeInTheDocument();
        });
    });

    describe('clear', () => {
        it('clears the selected value and hides itself', async () => {
            const onValueChange = vi.fn();
            render(<TestCombobox defaultValue="Banana" onValueChange={onValueChange} />);

            expect(screen.getByRole('combobox')).toHaveValue('Banana');

            await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

            expect(onValueChange).toHaveBeenLastCalledWith(null, expect.anything());
            expect(screen.getByRole('combobox')).toHaveValue('');
            expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
        });

        it('is not rendered while read-only, even with a selected value', () => {
            render(<TestCombobox readOnly defaultValue="Banana" />);

            expect(screen.getByRole('combobox')).toHaveValue('Banana');
            expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
        });

        it('is not rendered while nothing is selected', () => {
            render(<TestCombobox />);

            expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
        });
    });

    describe('trigger', () => {
        it('has a default accessible name', () => {
            render(<TestCombobox />);

            expect(screen.getByRole('button', { name: 'Open popup' })).toBeInTheDocument();
        });

        it('lets aria-label override the default name', () => {
            render(
                <Combobox.Root items={fruits} aria-label="Fruit">
                    <Combobox.InputGroupPrimitive>
                        <Combobox.InputPrimitive />
                        <Combobox.TriggerPrimitive aria-label="Show fruits" />
                    </Combobox.InputGroupPrimitive>
                </Combobox.Root>,
            );

            expect(screen.getByRole('button', { name: 'Show fruits' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Open popup' })).not.toBeInTheDocument();
        });
    });

    describe('icons', () => {
        const Custom = ({ testId }: { testId: string }) => (
            <svg data-testid={testId} width="10" height="12" />
        );

        it('sizes the default icons to fill their button', () => {
            render(<TestCombobox defaultValue="Apple" />);

            const icon = screen.getByRole('button', { name: 'Open popup' }).querySelector('svg');
            expect(icon).toHaveAttribute('width', '100%');
            expect(icon).toHaveAttribute('height', '100%');
        });

        it('keeps the size of icons passed as children', async () => {
            render(
                <Combobox.Root items={fruits} aria-label="Fruit" defaultValue="Apple" defaultOpen>
                    <Combobox.InputGroupPrimitive>
                        <Combobox.InputPrimitive />
                        <Combobox.ClearPrimitive>
                            <Custom testId="clear-icon" />
                        </Combobox.ClearPrimitive>
                        <Combobox.TriggerPrimitive>
                            <Custom testId="trigger-icon" />
                        </Combobox.TriggerPrimitive>
                    </Combobox.InputGroupPrimitive>
                    <Combobox.Popup>
                        {(fruit: string) => (
                            <Combobox.ItemPrimitive key={fruit} value={fruit}>
                                {fruit}
                                <Combobox.ItemIndicatorPrimitive>
                                    <Custom testId="indicator-icon" />
                                </Combobox.ItemIndicatorPrimitive>
                            </Combobox.ItemPrimitive>
                        )}
                    </Combobox.Popup>
                </Combobox.Root>,
            );

            for (const id of ['clear-icon', 'trigger-icon', 'indicator-icon']) {
                const icon = await screen.findByTestId(id);
                expect(icon).toHaveAttribute('width', '10');
                expect(icon).toHaveAttribute('height', '12');
            }
        });
    });

    describe('keyboard', () => {
        it('opens with ArrowDown and closes with Escape', async () => {
            render(<TestCombobox />);

            await userEvent.tab();
            await userEvent.keyboard('[ArrowDown]');
            expect(screen.getByRole('listbox')).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');
            await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
        });

        it('selects the highlighted option with Enter', async () => {
            const onValueChange = vi.fn();
            render(<TestCombobox onValueChange={onValueChange} />);

            await userEvent.type(screen.getByRole('combobox'), 'che');
            await userEvent.keyboard('[ArrowDown][Enter]');

            expect(onValueChange).toHaveBeenLastCalledWith('Cherry', expect.anything());
            expect(screen.getByRole('combobox')).toHaveValue('Cherry');
        });
    });

    describe('states', () => {
        it('marks the group and input as disabled', () => {
            render(<TestCombobox disabled />);

            expect(screen.getByTestId('group')).toHaveAttribute('data-disabled');
            expect(screen.getByRole('combobox')).toBeDisabled();
        });

        it('marks the group and input as read-only and ignores typing', async () => {
            render(<TestCombobox readOnly defaultValue="Apple" />);
            const input = screen.getByRole('combobox');

            expect(screen.getByTestId('group')).toHaveAttribute('data-readonly');
            expect(input).toHaveAttribute('readonly');

            await userEvent.type(input, 'xyz');
            expect(input).toHaveValue('Apple');
        });

        it('marks the group and input as invalid', () => {
            render(<TestCombobox invalid />);

            expect(screen.getByTestId('group')).toHaveAttribute('data-invalid');
            expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
        });

        it('does not mark the group as invalid by default', () => {
            render(<TestCombobox />);

            expect(screen.getByTestId('group')).not.toHaveAttribute('data-invalid');
            expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
        });
    });
});
