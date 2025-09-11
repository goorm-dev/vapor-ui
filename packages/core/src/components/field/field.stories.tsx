import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import { Box } from '~/components/box';
import { Button } from '~/components/button';
import { Checkbox } from '~/components/checkbox';
import { Flex } from '~/components/flex';
import { RadioGroup } from '~/components/radio-group';
import { Switch } from '~/components/switch';

import { Field } from './field';

const meta: Meta<typeof Field.Root> = {
    title: 'Field',
    component: Field.Root,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Field.Root>;

export const TestBed: Story = {
    render: () => {
        const [isChecked, setIsChecked] = useState(false);
        const [isFirstTouched, setIsFirstTouched] = useState(true);
        const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
        const [isNotificationTouched, setIsNotificationTouched] = useState(false);
        const [selectedPlan, setSelectedPlan] = useState('');
        const [isPlanTouched, setIsPlanTouched] = useState(false);

        const validateCheckbox = (value: boolean) => {
            if (!value) {
                return 'You must agree to the terms and conditions to continue';
            }
            return null;
        };

        const validateNotifications = (value: boolean) => {
            if (!value) {
                return 'Please enable notifications to receive important updates';
            }
            return null;
        };

        const validatePlan = (value: string) => {
            if (value.length === 0 || !value) {
                return 'customError';
            }
            return null;
        };

        const handleCheckboxChange = (checked: boolean) => {
            if (isFirstTouched) setIsFirstTouched(false);
            setIsChecked(checked);
        };

        const handleNotificationChange = (checked: boolean) => {
            if (!isNotificationTouched) setIsNotificationTouched(true);
            setIsNotificationEnabled(checked);
        };

        const handlePlanChange = (value: unknown) => {
            if (!isPlanTouched) setIsPlanTouched(true);
            setSelectedPlan(value as string);
        };

        const handleResetPlan = () => {
            setSelectedPlan('');
            setIsPlanTouched(true); // Mark as touched to show validation error
        };

        return (
            <Box padding="$225">
                <Flex flexDirection="column" gap="$225">
                    <Field.Root
                        name="policy-agreement"
                        validate={() => validateCheckbox(isChecked)}
                    >
                        <Checkbox.Root
                            required
                            checked={isChecked}
                            onCheckedChange={handleCheckboxChange}
                        >
                            <Checkbox.Control>
                                <ConfirmOutlineIcon />
                            </Checkbox.Control>
                            <Field.Label>agree</Field.Label>
                        </Checkbox.Root>
                        <Field.Description>
                            I agree to the Terms and Conditions and Privacy Policy
                        </Field.Description>
                        <Field.Error match="customError" />
                        <Field.Success>
                            ✓ Thank you for accepting our terms and conditions
                        </Field.Success>
                    </Field.Root>

                    {/* Switch Component Example */}
                    <Field.Root
                        name="notifications"
                        validate={() => validateNotifications(isNotificationEnabled)}
                    >
                        <Switch.Root
                            checked={isNotificationEnabled}
                            onCheckedChange={handleNotificationChange}
                        >
                            <Flex alignItems="center" gap="$150">
                                <Switch.Control />
                                <Field.Label>Enable push notifications</Field.Label>
                            </Flex>
                        </Switch.Root>
                        <Field.Description>
                            Get notified about important updates, security alerts, and account
                            activities
                        </Field.Description>
                        <Field.Error match="customError" />
                        <Field.Success>
                            ✓ Notifications enabled - you'll receive important updates
                        </Field.Success>
                    </Field.Root>

                    {/* RadioGroup Component Example */}
                    <Field.Root
                        name="subscription-plan"
                        validate={() => validatePlan(selectedPlan)}
                    >
                        <Field.Label>Choose your subscription plan</Field.Label>
                        <Field.Description>
                            Select a plan that best fits your needs. You can upgrade or downgrade
                            anytime.
                        </Field.Description>
                        <RadioGroup.Root
                            value={selectedPlan}
                            onValueChange={handlePlanChange}
                            invalid={isPlanTouched && validatePlan(selectedPlan) !== null}
                        >
                            <RadioGroup.Item value="basic">
                                <Flex alignItems="center" gap="$150">
                                    <RadioGroup.Control />
                                    <RadioGroup.Label>
                                        <Box>
                                            <div style={{ fontWeight: 'bold' }}>
                                                Basic Plan - Free
                                            </div>
                                        </Box>
                                    </RadioGroup.Label>
                                    <Field.Description style={{ fontSize: '14px', color: '#666' }}>
                                        Up to 5 projects, 1GB storage
                                    </Field.Description>
                                </Flex>
                            </RadioGroup.Item>
                            <RadioGroup.Item value="pro">
                                <Flex alignItems="center" gap="$150">
                                    <RadioGroup.Control />
                                    <RadioGroup.Label>
                                        <Box>
                                            <div style={{ fontWeight: 'bold' }}>
                                                Pro Plan - $9/month
                                            </div>
                                        </Box>
                                    </RadioGroup.Label>
                                    <Field.Description style={{ fontSize: '14px', color: '#666' }}>
                                        Unlimited projects, 100GB storage, Priority support
                                    </Field.Description>
                                </Flex>
                            </RadioGroup.Item>
                            <RadioGroup.Item value="enterprise">
                                <Flex alignItems="center" gap="$150">
                                    <RadioGroup.Control />
                                    <RadioGroup.Label>
                                        <Box>
                                            <div style={{ fontWeight: 'bold' }}>
                                                Enterprise - $29/month
                                            </div>
                                        </Box>
                                    </RadioGroup.Label>
                                    <Field.Description style={{ fontSize: '14px', color: '#666' }}>
                                        Everything in Pro + Advanced analytics, Custom integrations
                                    </Field.Description>
                                </Flex>
                            </RadioGroup.Item>
                        </RadioGroup.Root>
                        <Box marginTop="$150">
                            <Button variant="outline" size="md" onClick={handleResetPlan}>
                                Reset Selection
                            </Button>
                        </Box>
                        <Field.Error match="customError">
                            Please select a subscription plan to continue
                        </Field.Error>
                        <Field.Success>
                            ✓ Great choice! Your {selectedPlan} plan has been selected
                        </Field.Success>
                    </Field.Root>
                </Flex>
            </Box>
        );
    },
};
