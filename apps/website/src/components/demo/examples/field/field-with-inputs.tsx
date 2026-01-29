'use client';

import { Checkbox, Field, Select, Switch, TextInput, VStack } from '@vapor-ui/core';

export default function FieldWithInputs() {
    return (
        <VStack gap="$200" width="300px">
            <Field.Root name="email">
                <Field.Label flexDirection="column">
                    이메일
                    <TextInput type="email" placeholder="example@domain.com" />
                </Field.Label>
                <Field.Description>알림을 받을 이메일 주소를 입력하세요.</Field.Description>
                <Field.Error match="typeMismatch">유효한 이메일 주소를 입력해주세요.</Field.Error>
            </Field.Root>

            {/* Checkbox with Field */}
            <Field.Root name="newsletter">
                <Field.Item>
                    <Checkbox.Root />
                    <Field.Label>뉴스레터 구독</Field.Label>
                </Field.Item>
                <Field.Description>최신 소식과 업데이트를 이메일로 받아보세요.</Field.Description>
            </Field.Root>

            {/* Switch with Field */}
            <Field.Root name="notifications">
                <Field.Item>
                    <Switch.Root />
                    <Field.Label>푸시 알림</Field.Label>
                </Field.Item>
                <Field.Description>중요한 알림을 즉시 받아보세요.</Field.Description>
            </Field.Root>

            {/* Select with Field */}
            <Field.Root name="country">
                <Select.Root placeholder="국가를 선택하세요">
                    <Field.Label htmlFor="country-select" flexDirection="column">
                        국가
                        <Select.Trigger id="country-select" />
                    </Field.Label>
                    <Select.Popup>
                        <Select.Item value="kr">대한민국</Select.Item>
                        <Select.Item value="us">미국</Select.Item>
                        <Select.Item value="jp">일본</Select.Item>
                        <Select.Item value="cn">중국</Select.Item>
                    </Select.Popup>
                </Select.Root>
                <Field.Description>거주 중인 국가를 선택하세요.</Field.Description>
            </Field.Root>
        </VStack>
    );
}
