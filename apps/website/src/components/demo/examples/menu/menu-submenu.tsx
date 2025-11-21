'use client';

import { Button, Menu } from '@vapor-ui/core';

export default function MenuSubmenu() {
    return (
        <Menu.Root>
            <Menu.Trigger render={<Button>서브메뉴</Button>} />
            <Menu.Popup>
                <Menu.Item>새 파일</Menu.Item>
                <Menu.Item>파일 열기</Menu.Item>
                <Menu.Separator />

                <Menu.SubmenuRoot>
                    <Menu.SubmenuTriggerItem>최근 파일</Menu.SubmenuTriggerItem>
                    <Menu.SubmenuPopup>
                        <Menu.Item>document.txt</Menu.Item>
                        <Menu.Item>presentation.pptx</Menu.Item>
                        <Menu.Item>spreadsheet.xlsx</Menu.Item>
                        <Menu.Separator />
                        <Menu.Item>더 많은 파일...</Menu.Item>
                    </Menu.SubmenuPopup>
                </Menu.SubmenuRoot>

                <Menu.SubmenuRoot>
                    <Menu.SubmenuTriggerItem>내보내기</Menu.SubmenuTriggerItem>
                    <Menu.SubmenuPopup>
                        <Menu.Item>PDF로 내보내기</Menu.Item>
                        <Menu.Item>이미지로 내보내기</Menu.Item>
                        <Menu.Item>HTML로 내보내기</Menu.Item>
                    </Menu.SubmenuPopup>
                </Menu.SubmenuRoot>

                <Menu.Separator />
                <Menu.Item>종료</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
    );
}
