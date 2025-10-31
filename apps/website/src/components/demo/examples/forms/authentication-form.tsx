import { Children, cloneElement, isValidElement, useState } from 'react';

import './authentication-form.css';

import { Button, Field, Form, Select, TextInput, VStack } from '@vapor-ui/core';

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
    const [phoneNumber, setPhoneNumber] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    };

    const regex = /^[0-9\s-()]{6,20}$/;

    return (
        <VStack
            gap="$400"
            width="100%"
            padding="$300"
            borderRadius="$300"
            border="1px solid var(--vapor-color-border-normal)"
            render={<Form onSubmit={(e) => e.preventDefault()} />}
        >
            <VStack gap="$200">
                <Field.Root render={<VStack gap="$100" />}>
                    <Field.Label className="input-label">핸드폰 번호</Field.Label>

                    <Select.Root defaultValue={codes['+82']} size="lg">
                        <Group attached>
                            <Select.Trigger>
                                <Select.Value />
                                <Select.TriggerIcon />
                            </Select.Trigger>

                            <Select.Content>
                                {Object.entries(codes).map(([value, label]) => (
                                    <Select.Item key={value} value={value}>
                                        {label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>

                            <TextInput
                                style={{ flex: 1, width: '100%' }}
                                id="auth-phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                size="lg"
                            />

                            <Button type="button" size="lg" disabled={!regex.test(phoneNumber)}>
                                인증번호 받기
                            </Button>
                        </Group>
                    </Select.Root>

                    <Field.Error match="valueMissing">핸드폰 번호를 입력해주세요.</Field.Error>
                    <Field.Error match="patternMismatch">
                        올바른 핸드폰 번호를 입력해주세요.
                    </Field.Error>
                </Field.Root>

                <Field.Root render={<VStack gap="$100" />}>
                    <Field.Label className="input-label">인증번호</Field.Label>
                    <TextInput id="auth-verification-code" size="lg" required />
                    <Field.Error match="valueMissing">인증번호를 입력해주세요.</Field.Error>
                </Field.Root>
            </VStack>

            <Button size="lg">인증 완료</Button>
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
