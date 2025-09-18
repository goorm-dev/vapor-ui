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

        return cloneElement(child, {
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

export default function LoginForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    };

    const regex = /^[0-9\s-()]{6,20}$/;
    // const regex = /^\+[0-9](?:[- ]?[0-9]){,14}$/;

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
                    <label htmlFor="phone" className="input-label">
                        핸드폰 번호
                    </label>
                    {/* <Group attached> */}
                    <Select.Root defaultValue="+82">
                        <Group attached>
                            <Select.Trigger>
                                <Select.Value />
                                <Select.TriggerIcon />
                            </Select.Trigger>
                            <TextInput
                                value={phoneNumber}
                                onChange={handleChange}
                                onError={(e) => console.log(e)}
                                // onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <Button disabled={!regex.test(phoneNumber)}>인증번호 받기</Button>
                        </Group>
                    </Select.Root>
                    {/* </Group> */}
                </VStack>
                <VStack gap="$100">
                    <label htmlFor="verification-code" className="input-label">
                        인증번호
                    </label>
                    <TextInput id="verification-code" />
                </VStack>
            </VStack>

            <Button size="lg">인증 완료</Button>
        </VStack>
    );
}
