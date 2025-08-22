'use client';

import { Button, Menu } from '@vapor-ui/core';

export default function MenuGroups() {
    return (
        <Menu.Root>
            <Menu.Trigger render={<Button>그룹 메뉴</Button>} />
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Group>
                        <Menu.GroupLabel>파일</Menu.GroupLabel>
                        <Menu.Item>새 파일</Menu.Item>
                        <Menu.Item>파일 열기</Menu.Item>
                        <Menu.Item>파일 저장</Menu.Item>
                    </Menu.Group>
                    <Menu.Separator />
                    <Menu.Group>
                        <Menu.GroupLabel>편집</Menu.GroupLabel>
                        <Menu.Item>복사</Menu.Item>
                        <Menu.Item>붙여넣기</Menu.Item>
                        <Menu.Item>잘라내기</Menu.Item>
                    </Menu.Group>
                    <Menu.Separator />
                    <Menu.Group>
                        <Menu.GroupLabel>도구</Menu.GroupLabel>
                        <Menu.Item>설정</Menu.Item>
                        <Menu.Item>도움말</Menu.Item>
                    </Menu.Group>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
