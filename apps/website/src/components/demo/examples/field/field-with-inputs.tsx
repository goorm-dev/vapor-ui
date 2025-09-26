'use client';

import { Checkbox, Field, Select, Switch, TextInput } from '@vapor-ui/core';

export default function FieldWithInputs() {
    return (
        <div className="v-space-y-6">
            {/* TextInput with Field */}
            <Field.Root name="email" className="v-space-y-2">
                <Field.Label>이메일</Field.Label>
                <TextInput type="email" placeholder="example@domain.com" className="v-w-full" />
                <Field.Description>알림을 받을 이메일 주소를 입력하세요.</Field.Description>
            </Field.Root>

            {/* Checkbox with Field */}
            <Field.Root name="newsletter" className="v-space-y-2">
                <div className="v-flex v-items-center v-space-x-2">
                    <Checkbox.Root>
                        <Checkbox.Indicator />
                    </Checkbox.Root>
                    <Field.Label className="v-mb-0">뉴스레터 구독</Field.Label>
                </div>
                <Field.Description>최신 소식과 업데이트를 이메일로 받아보세요.</Field.Description>
            </Field.Root>

            {/* Switch with Field */}
            <Field.Root name="notifications" className="v-space-y-2">
                <div className="v-flex v-items-center v-justify-between">
                    <div>
                        <Field.Label>푸시 알림</Field.Label>
                        <Field.Description>중요한 알림을 즉시 받아보세요.</Field.Description>
                    </div>
                    <Switch.Root>
                        <Switch.Thumb />
                    </Switch.Root>
                </div>
            </Field.Root>

            {/* Select with Field */}
            <Field.Root name="country" className="v-space-y-2">
                <Field.Label>국가</Field.Label>
                <Select.Root placeholder="국가를 선택하세요">
                    <Select.Trigger />
                    <Select.Portal>
                        <Select.Positioner>
                            <Select.Content>
                                <Select.Item value="kr">대한민국</Select.Item>
                                <Select.Item value="us">미국</Select.Item>
                                <Select.Item value="jp">일본</Select.Item>
                                <Select.Item value="cn">중국</Select.Item>
                            </Select.Content>
                        </Select.Positioner>
                    </Select.Portal>
                </Select.Root>
                <Field.Description>거주 중인 국가를 선택하세요.</Field.Description>
            </Field.Root>
        </div>
    );
}
