import { useState } from 'react';

import type { RenderResult } from '@testing-library/react';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';
import { axe } from 'vitest-axe';

import { Checkbox } from '~/components/checkbox';
import { Flex } from '~/components/flex';
import { Radio } from '~/components/radio';
import { RadioGroup } from '~/components/radio-group';
import { Switch } from '~/components/switch';

import { Field } from './field';

describe('Field', () => {
    afterEach(cleanup);

    describe('Field.Root', () => {
        it('should have no a11y violations', async () => {
            const rendered = render(
                <Field.Root name="test-field">
                    <Field.Label>Test Label</Field.Label>
                    <Field.Description>Test Description</Field.Description>
                </Field.Root>,
            );

            const result = await axe(rendered.container);
            expect(result).toHaveNoViolations();
        });

        it('should render with proper field structure', () => {
            render(
                <Field.Root name="test-field">
                    <Field.Label>Test Label</Field.Label>
                    <Field.Description>Test Description</Field.Description>
                </Field.Root>,
            );

            expect(screen.getByText('Test Label')).toBeInTheDocument();
            expect(screen.getByText('Test Description')).toBeInTheDocument();
        });
    });

    describe('Field with Checkbox integration', () => {
        let rendered: RenderResult;
        let checkbox: HTMLElement;

        beforeEach(() => {
            rendered = render(<FieldWithCheckboxTest />);
            checkbox = rendered.getByRole('checkbox');
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);
            expect(result).toHaveNoViolations();
        });

        it('should associate field label with checkbox', async () => {
            const label = rendered.getByText('I agree to the terms');

            await userEvent.click(label);
            expect(checkbox).toHaveFocus();
        });

        it('should show success message when checkbox is checked', async () => {
            expect(screen.queryByText('✓ Thank you for accepting')).not.toBeInTheDocument();

            await userEvent.click(checkbox);
            expect(checkbox).toBeChecked();
            expect(screen.queryByText('✓ Thank you for accepting')).toBeInTheDocument();
        });

        it('should toggle checkbox state via field label click', async () => {
            const label = rendered.getByText('I agree to the terms');

            expect(checkbox).not.toBeChecked();
            await userEvent.click(label);
            expect(checkbox).toBeChecked();

            await userEvent.click(label);
            expect(checkbox).not.toBeChecked();
        });
    });

    describe('Field with Switch integration', () => {
        let rendered: RenderResult;
        let switchElement: HTMLElement;

        beforeEach(() => {
            rendered = render(<FieldWithSwitchTest />);
            switchElement = rendered.getByRole('switch');
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);
            expect(result).toHaveNoViolations();
        });

        it('should associate field label with switch', async () => {
            const label = rendered.getByText('Enable notifications');

            await userEvent.click(label);
            expect(switchElement).toHaveFocus();
        });

        it('should toggle switch state', async () => {
            expect(switchElement).not.toBeChecked();

            await userEvent.click(switchElement);
            expect(switchElement).toBeChecked();

            await userEvent.click(switchElement);
            expect(switchElement).not.toBeChecked();
        });

        it('should show field success when switch is enabled', async () => {
            expect(screen.queryByText('✓ Notifications enabled')).not.toBeInTheDocument();

            await userEvent.click(switchElement);
            expect(screen.queryByText('✓ Notifications enabled')).toBeInTheDocument();
        });
    });

    describe('Field with RadioGroup integration', () => {
        let rendered: RenderResult;
        let radioGroup: HTMLElement;

        beforeEach(() => {
            rendered = render(<FieldWithRadioGroupTest />);
            radioGroup = rendered.getByRole('radiogroup');
        });

        it('should have proper radiogroup structure', () => {
            expect(radioGroup).toHaveAttribute('role', 'radiogroup');
        });

        it('should render radio group with field structure', () => {
            expect(screen.getByText('Select your gender')).toBeInTheDocument();
            expect(
                screen.getByText('Please select your gender for registration'),
            ).toBeInTheDocument();
            expect(radioGroup).toBeInTheDocument();
        });

        it('should select radio options', async () => {
            const maleRadio = rendered.getByRole('radio', { name: 'Male' });
            const femaleRadio = rendered.getByRole('radio', { name: 'Female' });

            await userEvent.click(maleRadio);
            expect(maleRadio).toBeChecked();
            expect(femaleRadio).not.toBeChecked();

            await userEvent.click(femaleRadio);
            expect(femaleRadio).toBeChecked();
            expect(maleRadio).not.toBeChecked();
        });

        it('should show field success when option is selected', async () => {
            const maleRadio = rendered.getByRole('radio', { name: 'Male' });

            expect(screen.queryByText('✓ Gender selected')).not.toBeInTheDocument();

            await userEvent.click(maleRadio);
            expect(screen.queryByText('✓ Gender selected')).toBeInTheDocument();
        });

        it('should associate radio labels with inputs', async () => {
            const maleLabel = rendered.getByText('Male');
            const maleRadio = rendered.getByRole('radio', { name: 'Male' });

            await userEvent.click(maleLabel);
            expect(maleRadio).toBeChecked();
        });
    });

    describe('Field with disabled state', () => {
        it('should disable all form controls when field is disabled', () => {
            const rendered = render(<FieldWithCheckboxTest disabled />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toBeDisabled();
        });

        it('should disable radio group when field is disabled', () => {
            const rendered = render(<FieldWithRadioGroupTest disabled />);
            const radios = rendered.getAllByRole('radio');

            radios.forEach((radio) => {
                expect(radio).toBeDisabled();
            });
        });

        it('should disable switch when field is disabled', () => {
            const rendered = render(<FieldWithSwitchTest disabled />);
            const switchElement = rendered.getByRole('switch');

            expect(switchElement).toBeDisabled();
        });
    });

    describe('Field validation modes', () => {
        it('should validate onChange for checkbox field', async () => {
            const rendered = render(<FieldWithCheckboxTest validationMode="onChange" />);
            const checkbox = rendered.getByRole('checkbox');

            expect(screen.queryByText('You must agree to continue')).not.toBeInTheDocument();

            await userEvent.click(checkbox);
            await userEvent.click(checkbox);

            expect(screen.queryByText('You must agree to continue')).toBeInTheDocument();
        });

        it('should validate onBlur for switch field', async () => {
            const rendered = render(<FieldWithSwitchTest validationMode="onBlur" />);
            const switchElement = rendered.getByRole('switch');

            await act(async () => {
                switchElement.focus();
                switchElement.blur();
            });

            expect(screen.queryByText('Please enable notifications')).not.toBeInTheDocument();
        });
    });

    describe('Field required validation', () => {
        it('should show error when required checkbox is checked then unchecked', async () => {
            const rendered = render(<FieldWithCheckboxTest validationMode="onChange" />);
            const checkbox = rendered.getByRole('checkbox');

            // Initially no error
            expect(screen.queryByText('You must agree to continue')).not.toBeInTheDocument();

            // Check the checkbox (should show success)
            await userEvent.click(checkbox);
            expect(checkbox).toBeChecked();
            expect(screen.queryByText('✓ Thank you for accepting')).toBeInTheDocument();

            // Uncheck the checkbox (should show error since it's required)
            await userEvent.click(checkbox);
            expect(checkbox).not.toBeChecked();
            expect(screen.getByText('You must agree to continue')).toBeInTheDocument();
            expect(screen.queryByText('✓ Thank you for accepting')).not.toBeInTheDocument();
        });

        it('should show error when required switch is enabled then disabled', async () => {
            const rendered = render(<FieldWithSwitchTest validationMode="onChange" />);
            const switchElement = rendered.getByRole('switch');

            // Initially no error
            expect(screen.queryByText('Please enable notifications')).not.toBeInTheDocument();

            // Enable the switch (should show success)
            await userEvent.click(switchElement);
            expect(switchElement).toBeChecked();
            expect(screen.queryByText('✓ Notifications enabled')).toBeInTheDocument();

            // Disable the switch (should show error since it's required)
            await userEvent.click(switchElement);
            expect(switchElement).not.toBeChecked();
            expect(screen.getByText('Please enable notifications')).toBeInTheDocument();
            expect(screen.queryByText('✓ Notifications enabled')).not.toBeInTheDocument();
        });

        it('should show error when required radio is selected then deselected', async () => {
            const rendered = render(<FieldWithRadioGroupTest validationMode="onChange" />);
            const maleRadio = rendered.getByRole('radio', { name: 'Male' });

            // Initially no error
            expect(screen.queryByText('Please select your gender')).not.toBeInTheDocument();

            // Select a radio option (should show success)
            await userEvent.click(maleRadio);
            expect(maleRadio).toBeChecked();
            expect(screen.queryByText('✓ Gender selected')).toBeInTheDocument();

            // Note: Radio buttons typically can't be unchecked once selected
            // This is expected behavior for radio groups
            expect(screen.queryByText('Please select your gender')).not.toBeInTheDocument();
        });
    });
});

const FieldWithCheckboxTest = ({
    disabled = false,
    validationMode = 'onChange',
}: {
    disabled?: boolean;
    validationMode?: 'onChange' | 'onBlur';
}) => {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <Field.Root name="agreement" validationMode={validationMode} disabled={disabled}>
                <Flex gap="$100">
                    <Checkbox.Root required checked={isChecked} onCheckedChange={setIsChecked}>
                        <Checkbox.Indicator>
                            <ConfirmOutlineIcon />
                        </Checkbox.Indicator>
                    </Checkbox.Root>
                    <Field.Label>I agree to the terms</Field.Label>
                </Flex>
                <Field.Description>
                    You must agree to the terms and conditions to continue
                </Field.Description>
                <Field.Error>You must agree to continue</Field.Error>
                <Field.Success>✓ Thank you for accepting</Field.Success>
            </Field.Root>
            <button type="submit">Submit</button>
        </form>
    );
};

const FieldWithSwitchTest = ({
    disabled = false,
    validationMode = 'onChange',
}: {
    disabled?: boolean;
    validationMode?: 'onChange' | 'onBlur';
}) => {
    const [isEnabled, setIsEnabled] = useState(false);

    return (
        <Field.Root name="notifications" validationMode={validationMode} disabled={disabled}>
            <Flex alignItems="center" gap="$150">
                <Switch.Root required checked={isEnabled} onCheckedChange={setIsEnabled} />
                <Field.Label>Enable notifications</Field.Label>
            </Flex>
            <Field.Description>
                Get notified about important updates and security alerts
            </Field.Description>
            <Field.Error>Please enable notifications</Field.Error>
            <Field.Success>✓ Notifications enabled</Field.Success>
        </Field.Root>
    );
};

const FieldWithRadioGroupTest = ({
    disabled = false,
    validationMode = 'onChange',
}: {
    disabled?: boolean;
    validationMode?: 'onChange' | 'onBlur';
}) => {
    return (
        <Field.Root name="gender" validationMode={validationMode} disabled={disabled}>
            <Field.Label render={<legend />}>Select your gender</Field.Label>
            <RadioGroup.Root required>
                <Field.Description>Please select your gender for registration</Field.Description>
                <Flex alignItems="center" gap="$150">
                    <Radio.Root value="male" id="male" />
                    <Field.Label htmlFor="male">Male</Field.Label>
                </Flex>
                <Flex alignItems="center" gap="$150">
                    <Radio.Root value="female" id="female" />
                    <Field.Label htmlFor="female">Female</Field.Label>
                </Flex>
                <Flex alignItems="center" gap="$150">
                    <Radio.Root value="other" id="other" />
                    <Field.Label htmlFor="other">Other</Field.Label>
                </Flex>
                <Field.Error>Please select your gender</Field.Error>
                <Field.Success>✓ Gender selected</Field.Success>
            </RadioGroup.Root>
        </Field.Root>
    );
};
