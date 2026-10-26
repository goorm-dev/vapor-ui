'use client';

import { useState } from 'react';

import { Button, Menu } from '@vapor-ui/core';

export default function MenuCheckbox() {
    const [showToolbar, setShowToolbar] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showStatusbar, setShowStatusbar] = useState(true);

    return (
        <Menu.Root>
            <Menu.Trigger render={<Button>보기 설정</Button>} />
            <Menu.Popup>
                <Menu.Group>
                    <Menu.GroupLabel>보기 옵션</Menu.GroupLabel>
                    <Menu.CheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
                        툴바 표시
                    </Menu.CheckboxItem>
                    <Menu.CheckboxItem checked={showSidebar} onCheckedChange={setShowSidebar}>
                        사이드바 표시
                    </Menu.CheckboxItem>
                    <Menu.CheckboxItem checked={showStatusbar} onCheckedChange={setShowStatusbar}>
                        상태바 표시
                    </Menu.CheckboxItem>
                </Menu.Group>
            </Menu.Popup>
        </Menu.Root>
    );
}
