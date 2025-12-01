import { Children, cloneElement, isValidElement } from 'react';

import './authentication-form.css';

import { Controller, useForm } from 'react-hook-form';

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

interface AuthFormData {
    countryCode: string;
    phoneNumber: string;
    verificationCode: string;
}

export default function AuthenticationForm() {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<AuthFormData>({
        defaultValues: {
            countryCode: codes['+82'],
            phoneNumber: '',
            verificationCode: '',
        },
    });

    const phoneNumber = watch('phoneNumber');
    const regex = /^[0-9\s-()]{6,20}$/;

    const onSubmit = (data: AuthFormData) => {
        console.log('Authentication form submitted:', data);
    };

    return (
        <VStack
            gap="$400"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            render={<Form onSubmit={handleSubmit(onSubmit)} />}
        >
            <VStack gap="$200">
                <Field.Root invalid={!!errors.phoneNumber}>
                    <Box render={<Field.Label htmlFor="auth-phone" />} flexDirection="column">
                        <Text typography="subtitle2" foreground="normal-200">
                            핸드폰 번호
                        </Text>
                        <Controller
                            name="countryCode"
                            control={control}
                            render={({ field }) => (
                                <Select.Root
                                    value={field.value}
                                    onValueChange={field.onChange}
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
                                            size="lg"
                                            {...register('phoneNumber', {
                                                required: '핸드폰 번호를 입력해주세요.',
                                                pattern: {
                                                    value: /[0-9]{3}-[0-9]{3}-[0-9]{4}/,
                                                    message: '올바른 핸드폰 번호를 입력해주세요.',
                                                },
                                            })}
                                        />

                                        <Button
                                            type="button"
                                            size="lg"
                                            disabled={!regex.test(phoneNumber)}
                                        >
                                            인증번호 받기
                                        </Button>
                                    </Group>
                                </Select.Root>
                            )}
                        />
                    </Box>

                    {errors.phoneNumber && (
                        <Field.Error>{errors.phoneNumber.message}</Field.Error>
                    )}
                </Field.Root>

                <Field.Root invalid={!!errors.verificationCode}>
                    <Box render={<Field.Label />} flexDirection="column">
                        <Text typography="subtitle2" foreground="normal-200">
                            인증번호
                        </Text>
                        <TextInput
                            id="auth-verification-code"
                            size="lg"
                            {...register('verificationCode', {
                                required: '인증번호를 입력해주세요.',
                            })}
                        />
                    </Box>
                    {errors.verificationCode && (
                        <Field.Error>{errors.verificationCode.message}</Field.Error>
                    )}
                </Field.Root>
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
