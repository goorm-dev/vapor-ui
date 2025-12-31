import { Children, cloneElement, isValidElement } from 'react';

import './authentication-form.css';

import { useForm } from '@tanstack/react-form';
import { Box, Button, Field, Form, Select, Text, TextInput, VStack } from '@vapor-ui/core';

const codes = {
    '+82': '🇰🇷 +82',
    '+1': '🇺🇸 +1',
    '+34': '🇪🇸 +34',
    '+33': '🇫🇷 +33',
    '+39': '🇮🇹 +39',
    '+44': '🇬🇧 +44',
    '+81': '🇯🇵 +81',
    '+86': '🇨🇳 +86',
    '+7': '🇷🇺 +7',
};

export default function AuthenticationForm() {
    const form = useForm({
        defaultValues: {
            countryCode: '+82',
            phoneNumber: '',
            verificationCode: '',
        },
        onSubmit: async ({ value }) => {
            console.log('Form submitted:', value);
        },
    });

    const regex = /^[0-9\s-()]{6,20}$/;

    return (
        <VStack
            gap="$400"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            render={
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                />
            }
        >
            <VStack gap="$200">
                <form.Field
                    name="phoneNumber"
                    validators={{
                        onChange: ({ value }) => {
                            if (!value) return '핸드폰 번호를 입력해주세요.';
                            if (!/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(value))
                                return '올바른 핸드폰 번호를 입력해주세요.';
                            return undefined;
                        },
                    }}
                >
                    {(phoneField) => (
                        <Field.Root invalid={phoneField.state.meta.errors.length > 0}>
                            <Box
                                render={<Field.Label htmlFor="auth-phone" />}
                                flexDirection="column"
                            >
                                <Text typography="subtitle2" foreground="normal-200">
                                    핸드폰 번호
                                </Text>
                                <form.Field name="countryCode">
                                    {(countryField) => (
                                        <Select.Root
                                            value={countryField.state.value}
                                            onValueChange={(value) =>
                                                countryField.handleChange(value as string)
                                            }
                                            size="lg"
                                        >
                                            <Group attached>
                                                <Select.Trigger />

                                                <Select.Popup>
                                                    {Object.entries(codes).map(([value, label]) => (
                                                        <Select.Item key={value} value={value}>
                                                            {label}
                                                        </Select.Item>
                                                    ))}
                                                </Select.Popup>

                                                <TextInput
                                                    style={{ flex: 1, width: '100%' }}
                                                    id="auth-phone"
                                                    type="tel"
                                                    value={phoneField.state.value}
                                                    onChange={(e) =>
                                                        phoneField.handleChange(e.target.value)
                                                    }
                                                    onBlur={phoneField.handleBlur}
                                                    size="lg"
                                                />

                                                <Button
                                                    type="button"
                                                    size="lg"
                                                    disabled={!regex.test(phoneField.state.value)}
                                                >
                                                    인증번호 받기
                                                </Button>
                                            </Group>
                                        </Select.Root>
                                    )}
                                </form.Field>
                            </Box>

                            {phoneField.state.meta.errors.length > 0 && (
                                <Field.Error match>{phoneField.state.meta.errors[0]}</Field.Error>
                            )}
                        </Field.Root>
                    )}
                </form.Field>

                <form.Field
                    name="verificationCode"
                    validators={{
                        onChange: ({ value }) => {
                            if (!value) return '인증번호를 입력해주세요.';
                            return undefined;
                        },
                    }}
                >
                    {(field) => (
                        <Field.Root invalid={field.state.meta.errors.length > 0}>
                            <Box render={<Field.Label />} flexDirection="column">
                                <Text typography="subtitle2" foreground="normal-200">
                                    인증번호
                                </Text>
                                <TextInput
                                    id="auth-verification-code"
                                    size="lg"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                />
                            </Box>
                            {field.state.meta.errors.length > 0 && (
                                <Field.Error match>{field.state.meta.errors[0]}</Field.Error>
                            )}
                        </Field.Root>
                    )}
                </form.Field>
            </VStack>

            <Button type="submit" size="lg">
                인증 완료
            </Button>
        </VStack>
    );
}

interface GroupProps {
    attached?: boolean;
    children?: React.ReactNode;
}

const Group = ({ attached = false, children: childrenProp }: GroupProps) => {
    const children = Children.map(childrenProp, (child, index) => {
        if (!isValidElement(child)) return;

        return cloneElement(child as React.ReactElement, {
            style: { '--group-index': index, ...child.props.style },
            ...(index === 0 ? { 'data-first-item': '' } : {}),
            ...(index === Children.count(childrenProp) - 1 ? { 'data-last-item': '' } : {}),
        });
    });

    return (
        <div data-part="group" className={`group` + (attached ? ' attached' : '')}>
            {children}
        </div>
    );
};
