'use client';

import { useState } from 'react';

import { Button, Menu } from '@vapor-ui/core';

export default function MenuRadio() {
    const [fontSize, setFontSize] = useState('medium');

    return (
        <Menu.Root>
            <Menu.Trigger render={<Button>글꼴 크기</Button>} />
            <Menu.Popup>
                <Menu.Group>
                    <Menu.GroupLabel>글꼴 크기 선택</Menu.GroupLabel>
                    <Menu.RadioGroup value={fontSize} onValueChange={setFontSize}>
                        <Menu.RadioItem value="small">작게 (12px)</Menu.RadioItem>
                        <Menu.RadioItem value="medium">보통 (14px)</Menu.RadioItem>
                        <Menu.RadioItem value="large">크게 (16px)</Menu.RadioItem>
                        <Menu.RadioItem value="xl">매우 크게 (18px)</Menu.RadioItem>
                    </Menu.RadioGroup>
                </Menu.Group>
            </Menu.Popup>
        </Menu.Root>
    );
}
