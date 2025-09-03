'use client';

import { Button, Menu } from '@vapor-ui/core';

export default function DefaultMenu() {
    return (
        <Menu.Root>
            <Menu.Trigger render={<Button>메뉴 열기</Button>} />
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Item>새 파일</Menu.Item>
                    <Menu.Item>새 폴더</Menu.Item>
                    <Menu.Separator />
                    <Menu.Item>복사</Menu.Item>
                    <Menu.Item>붙여넣기</Menu.Item>
                    <Menu.Separator />
                    <Menu.Item>삭제</Menu.Item>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
