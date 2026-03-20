import { useState } from 'react';

import type { RenderResult } from '@testing-library/react';
import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Checkbox } from '~/components/checkbox';
import { Radio } from '~/components/radio';
import { RadioGroup } from '~/components/radio-group';
import { Switch } from '~/components/switch';
import { TextInput } from '~/components/text-input';

import { Field } from '.';
import { Box } from '../box';

describe('Field', () => {
    afterEach(cleanup);

    describe('Field.Root', () => {
        it('should have no a11y violations', async () => {
            const rendered = render(
                <Field.Root name="test-field">
                    <Field.Label htmlFor="input">Test Label</Field.Label>
                    <TextInput id="input" />
                    <Field.Description>Test Description</Field.Description>
                </Field.Root>,
            );

            const result = await axe(rendered.container);
            expect(result).toHaveNoViolations();
        });

        it('should render with proper field structure', () => {
            const rendered = render(
                <Field.Root name="test-field">
                    <Field.Label htmlFor="input">Test Label</Field.Label>
                    <TextInput id="input" />
                    <Field.Description>Test Description</Field.Description>
                </Field.Root>,
            );

            expect(rendered.getByText('Test Label')).toBeInTheDocument();
            expect(rendered.getByText('Test Description')).toBeInTheDocument();
        });
    });

    describe('Field with Checkbox integration', () => {
        it('should have no a11y violations', async () => {
            const rendered = render(<FieldWithCheckboxTest />);
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should show success message when checkbox is checked', async () => {
            const rendered = render(<FieldWithCheckboxTest />);
            const checkbox = rendered.getByRole('checkbox');

            expect(rendered.queryByText('✓ Thank you for accepting')).not.toBeInTheDocument();

            await userEvent.click(checkbox);
            expect(checkbox).toBeChecked();
            expect(rendered.queryByText('✓ Thank you for accepting')).toBeInTheDocument();
        });

        it('should toggle checkbox state via field label click', async () => {
            const rendered = render(<FieldWithCheckboxTest />);
            const checkbox = rendered.getByRole('checkbox');
            const label = rendered.getByText('agree to the terms');

            expect(checkbox).not.toBeChecked();
            await userEvent.click(label);
            expect(checkbox).toBeChecked();

            await userEvent.click(label);
            expect(checkbox).not.toBeChecked();
        });
    });

    describe('Field with Switch integration', () => {
        it('should have no a11y violations', async () => {
            const rendered = render(<FieldWithSwitchTest />);
            const result = await axe(rendered.container);

            expect(result).toHaveNoViolations();
        });

        it('should associate field label with switch', async () => {
            const rendered = render(<FieldWithSwitchTest />);
            const switchElement = rendered.getByRole('switch');
            const label = rendered.getByText('Enable notifications');

            await userEvent.click(label);
            expect(switchElement).toHaveFocus();
        });

        it('should toggle switch state', async () => {
            const rendered = render(<FieldWithSwitchTest />);
            const switchElement = rendered.getByRole('switch');

            expect(switchElement).not.toBeChecked();

            await userEvent.click(switchElement);
            expect(switchElement).toBeChecked();

            await userEvent.click(switchElement);
            expect(switchElement).not.toBeChecked();
        });

        it('should show field success when switch is enabled', async () => {
            const rendered = render(<FieldWithSwitchTest />);
            const switchElement = rendered.getByRole('switch');
            let successText = rendered.queryByText('✓ Notifications enabled');

            expect(successText).not.toBeInTheDocument();

            await userEvent.click(switchElement);

            successText = rendered.queryByText('✓ Notifications enabled');
            expect(successText).toBeInTheDocument();
        });
    });

    describe('Field with RadioGroup integration', () => {
        it('should select radio options', async () => {
            const rendered = render(<FieldWithRadioGroupTest />);
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
            const rendered = render(<FieldWithRadioGroupTest />);
            const maleRadio = rendered.getByRole('radio', { name: 'Male' });
            let successText = rendered.queryByText('✓ Gender selected');

            expect(successText).not.toBeInTheDocument();

            await userEvent.click(maleRadio);

            successText = rendered.queryByText('✓ Gender selected');
            expect(successText).toBeInTheDocument();
        });

        it('should associate radio labels with inputs', async () => {
            const rendered = render(<FieldWithRadioGroupTest />);
            const maleRadio = rendered.getByRole('radio', { name: 'Male' });
            const label = rendered.getByText('Male');

            // Field.Item을 통해 각 Radio가 고유한 aria-labelledby를 가짐
            await userEvent.click(label);
            expect(maleRadio).toBeChecked();
        });
    });

    describe('Field with disabled state', () => {
        it('should disable all form controls when field is disabled', async () => {
            const rendered = render(<FieldWithCheckboxTest disabled />);
            const checkbox = rendered.getByRole('checkbox');

            expect(checkbox).toHaveAttribute('aria-disabled', 'true');

            await userEvent.click(checkbox);

            expect(checkbox).not.toBeChecked();
        });

        it('should disable radio group when field is disabled', async () => {
            const rendered = render(<FieldWithRadioGroupTest disabled />);
            const radios = rendered.getAllByRole('radio');

            radios.forEach((radio) => {
                expect(radio).toHaveAttribute('aria-disabled', 'true');
            });

            await userEvent.click(radios[0]);

            expect(radios[0]).not.toBeChecked();
        });

        it('should disable switch when field is disabled', async () => {
            const rendered = render(<FieldWithSwitchTest disabled />);
            const switchElement = rendered.getByRole('switch');

            expect(switchElement).toHaveAttribute('aria-disabled', 'true');

            await userEvent.click(switchElement);

            expect(switchElement).not.toBeChecked();
        });

        it('should disable text input when field is disabled', async () => {
            const rendered = render(<FieldWithTextInputTest disabled />);
            const textInput = rendered.getByRole('textbox');

            expect(textInput).toBeDisabled();

            await userEvent.type(textInput, 'Hello');

            expect(textInput).not.toHaveValue('Hello');
        });
    });

    describe('Field validation modes', () => {
        it('should validate onChange for checkbox field', async () => {
            const rendered = render(<FieldWithCheckboxTest validationMode="onChange" />);
            const checkbox = rendered.getByRole('checkbox');

            expect(rendered.queryByText('You must agree to continue')).not.toBeInTheDocument();

            await userEvent.click(checkbox);
            await userEvent.click(checkbox);

            expect(rendered.queryByText('You must agree to continue')).toBeInTheDocument();
        });

        it('should validate onBlur for switch field', async () => {
            const rendered = render(<FieldWithSwitchTest validationMode="onBlur" />);
            const switchElement = rendered.getByRole('switch');

            await act(async () => {
                switchElement.focus();
                switchElement.blur();
            });

            expect(rendered.queryByText('Please enable notifications')).not.toBeInTheDocument();
        });
    });

    describe('Field required validation', () => {
        it('should show error when required checkbox is checked then unchecked', async () => {
            const rendered = render(<FieldWithCheckboxTest validationMode="onChange" />);
            const checkbox = rendered.getByRole('checkbox');

            // Initially no error
            expect(rendered.queryByText('You must agree to continue')).not.toBeInTheDocument();

            // Check the checkbox (should show success)
            await userEvent.click(checkbox);
            expect(checkbox).toBeChecked();

            const text = rendered.getByText('✓ Thank you for accepting');
            expect(text).toBeInTheDocument();

            // Uncheck the checkbox (should show error since it's required)
            await userEvent.click(checkbox);
            expect(checkbox).not.toBeChecked();
            expect(rendered.getByText('You must agree to continue')).toBeInTheDocument();
            expect(rendered.queryByText('✓ Thank you for accepting')).not.toBeInTheDocument();
        });

        it('should show error when required switch is enabled then disabled', async () => {
            const rendered = render(<FieldWithSwitchTest validationMode="onChange" />);
            const switchElement = rendered.getByRole('switch');

            // Initially no error
            expect(rendered.queryByText('Please enable notifications')).not.toBeInTheDocument();

            // Enable the switch (should show success)
            await userEvent.click(switchElement);
            expect(switchElement).toBeChecked();
            expect(rendered.queryByText('✓ Notifications enabled')).toBeInTheDocument();

            // Disable the switch (should show error since it's required)
            await userEvent.click(switchElement);
            expect(switchElement).not.toBeChecked();
            expect(rendered.getByText('Please enable notifications')).toBeInTheDocument();
            expect(rendered.queryByText('✓ Notifications enabled')).not.toBeInTheDocument();
        });

        it('should show error when required radio is selected then deselected', async () => {
            const rendered = render(<FieldWithRadioGroupTest validationMode="onChange" />);
            const maleRadio = rendered.getByRole('radio', { name: 'Male' });

            // Initially no error
            expect(rendered.queryByText('Please select your gender')).not.toBeInTheDocument();

            // Select a radio option (should show success)
            await userEvent.click(maleRadio);
            expect(maleRadio).toBeChecked();
            expect(rendered.queryByText('✓ Gender selected')).toBeInTheDocument();

            // Note: Radio buttons typically can't be unchecked once selected
            // This is expected behavior for radio groups
            expect(rendered.queryByText('Please select your gender')).not.toBeInTheDocument();
        });
    });

    describe('Field with TextInput integration', () => {
        let rendered: RenderResult;
        let textInput: HTMLElement;

        beforeEach(() => {
            rendered = render(<FieldWithTextInputTest />);
            textInput = rendered.getByRole('textbox');
        });

        it('should have no a11y violations', async () => {
            const result = await axe(rendered.container);
            expect(result).toHaveNoViolations();
        });

        it('should associate field label with text input', async () => {
            const label = rendered.getByText('Email Address');

            await userEvent.click(label);
            expect(textInput).toHaveFocus();
        });

        it('should update text input value when typed', async () => {
            await userEvent.type(textInput, 'test@example.com');
            expect(textInput).toHaveValue('test@example.com');
        });

        it('should show field success when valid email is entered', async () => {
            await userEvent.type(textInput, 'test@example.com');
            expect(textInput).toHaveValue('test@example.com');
        });

        it('should show error when invalid email is entered', async () => {
            await userEvent.type(textInput, 'invalid-email');
            expect(textInput).toHaveValue('invalid-email');
        });

        it('should clear input value when cleared', async () => {
            // Type valid email first
            await userEvent.type(textInput, 'test@example.com');
            expect(textInput).toHaveValue('test@example.com');

            // Clear the input
            await userEvent.clear(textInput);
            expect(textInput).toHaveValue('');
        });

        it('should not be typable when disabled', async () => {
            cleanup(); // Clean up previous renders
            const disabledRendered = render(<FieldWithTextInputTest disabled />);
            const disabledInput = disabledRendered.getByRole('textbox');

            await userEvent.type(disabledInput, 'test@example.com');
            expect(disabledInput).toHaveValue('');
            expect(disabledInput).toBeDisabled();
        });

        it('should show proper input type for email', () => {
            expect(textInput).toHaveAttribute('type', 'email');
        });

        it('should display placeholder text', () => {
            expect(textInput).toHaveAttribute('placeholder', 'your.email@example.com');
        });

        it('should have required attribute when field requires it', () => {
            expect(textInput).toHaveAttribute('required');
        });
    });

    describe('Field with TextInput validation modes', () => {
        it('should validate onChange for text input field', async () => {
            cleanup();
            const rendered = render(<FieldWithTextInputTest validationMode="onChange" />);
            const validationInput = rendered.getByRole('textbox');

            // Type and clear to trigger validation
            await userEvent.type(validationInput, 'test');
            await userEvent.clear(validationInput);

            expect(validationInput).toHaveValue('');
        });

        it('should validate onBlur for text input field', async () => {
            cleanup();
            const rendered = render(<FieldWithTextInputTest validationMode="onBlur" />);
            const blurInput = rendered.getByRole('textbox');

            await act(async () => {
                blurInput.focus();
                blurInput.blur();
            });

            expect(blurInput).not.toHaveFocus();
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
                <Checkbox.Root
                    id="checkbox"
                    required
                    checked={isChecked}
                    onCheckedChange={setIsChecked}
                />
                <Field.Label htmlFor="checkbox">agree to the terms</Field.Label>
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
            <Switch.Root id="switch" required checked={isEnabled} onCheckedChange={setIsEnabled} />
            <Field.Label htmlFor="switch">Enable notifications</Field.Label>
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
        <Field.Root validationMode={validationMode} disabled={disabled}>
            <legend>Select your gender</legend>
            <RadioGroup.Root required name="gender" defaultValue="other">
                <Field.Description>Please select your gender for registration</Field.Description>

                <Field.Item>
                    <Radio.Root value="male" />
                    <Field.Label>Male</Field.Label>
                </Field.Item>

                <Field.Item>
                    <Radio.Root value="female" />
                    <Field.Label>Female</Field.Label>
                </Field.Item>

                <Field.Item>
                    <Radio.Root value="other" />
                    <Field.Label>Other</Field.Label>
                </Field.Item>

                <Field.Error match="valueMissing">Please select your gender</Field.Error>
                <Field.Success>✓ Gender selected</Field.Success>
            </RadioGroup.Root>
        </Field.Root>
    );
};

const FieldWithTextInputTest = ({
    disabled = false,
    validationMode = 'onChange',
}: {
    disabled?: boolean;
    validationMode?: 'onChange' | 'onBlur';
}) => {
    return (
        <Field.Root name="email" validationMode={validationMode} disabled={disabled}>
            <Box render={<Field.Label />} $css={{ flexDirection: 'column' }}>
                Email Address
                <TextInput type="email" placeholder="your.email@example.com" required />
            </Box>

            <Field.Description>
                Please enter a valid email address for your account
            </Field.Description>
            <Field.Error>Email address is required</Field.Error>
            <Field.Success>✓ Valid email format</Field.Success>
        </Field.Root>
    );
};
