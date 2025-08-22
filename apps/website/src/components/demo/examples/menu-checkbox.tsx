"use client";

import { Button, Menu } from '@vapor-ui/core';
import { useState } from 'react';

export default function MenuCheckbox() {
    const [showToolbar, setShowToolbar] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showStatusbar, setShowStatusbar] = useState(true);

    return (
        <Menu.Root>
            <Menu.Trigger>
                <Button>보기 설정</Button>
            </Menu.Trigger>
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Group>
                        <Menu.GroupLabel>보기 옵션</Menu.GroupLabel>
                        <Menu.CheckboxItem
                            checked={showToolbar}
                            onCheckedChange={setShowToolbar}
                        >
                            툴바 표시
                        </Menu.CheckboxItem>
                        <Menu.CheckboxItem
                            checked={showSidebar}
                            onCheckedChange={setShowSidebar}
                        >
                            사이드바 표시
                        </Menu.CheckboxItem>
                        <Menu.CheckboxItem
                            checked={showStatusbar}
                            onCheckedChange={setShowStatusbar}
                        >
                            상태바 표시
                        </Menu.CheckboxItem>
                    </Menu.Group>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}