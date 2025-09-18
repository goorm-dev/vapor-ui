import { Children, cloneElement, isValidElement, useState } from 'react';

import './index.css';

import { Button, Select, TextInput, VStack } from '@vapor-ui/core';

interface GroupProps {
    attached?: boolean;
    children: React.ReactNode;
}

const Group = ({ attached = false, children: childrenProp }: GroupProps) => {
    const children = Children.map(childrenProp, (child, index) => {
        if (!isValidElement(child)) return;

        return cloneElement(child as React.ReactElement, {
            style: { '--group-index': index },
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

export default function AuthenticationForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    };

    const regex = /^[0-9\s-()]{6,20}$/;

    return (
        <VStack
            gap="$400"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid #eee"
            className="login"
        >
            <VStack gap="$200" render={<form onSubmit={(e) => e.preventDefault()} />}>
                <VStack gap="$100">
                    <label htmlFor="auth-phone" className="input-label">
                        핸드폰 번호
                    </label>
                    <Select.Root defaultValue="+82">
                        <Group attached>
                            <Select.Trigger>
                                <Select.Value />
                                <Select.TriggerIcon />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="+82">
                                    +82 <Select.ItemIndicator />
                                </Select.Item>
                                <Select.Item value="+1">
                                    +1 <Select.ItemIndicator />
                                </Select.Item>
                                <Select.Item value="+34">
                                    +34 <Select.ItemIndicator />
                                </Select.Item>
                                <Select.Item value="+32">
                                    +32 <Select.ItemIndicator />
                                </Select.Item>
                                <Select.Item value="+39">
                                    +39 <Select.ItemIndicator />
                                </Select.Item>
                                <Select.Item value="+44">
                                    +44 <Select.ItemIndicator />
                                </Select.Item>
                                <Select.Item value="+81">
                                    +81 <Select.ItemIndicator />
                                </Select.Item>
                                <Select.Item value="+86">
                                    +86 <Select.ItemIndicator />
                                </Select.Item>
                            </Select.Content>
                            <TextInput
                                id="auth-phone"
                                value={phoneNumber}
                                onChange={handleChange}
                            />
                            <Button disabled={!regex.test(phoneNumber)}>인증번호 받기</Button>
                        </Group>
                    </Select.Root>
                </VStack>
                <VStack gap="$100">
                    <label htmlFor="auth-verification-code" className="input-label">
                        인증번호
                    </label>
                    <TextInput id="auth-verification-code" />
                </VStack>
            </VStack>

            <Button size="lg">인증 완료</Button>
        </VStack>
    );
}
