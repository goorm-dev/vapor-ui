"use client";

import { Button, Menu } from '@vapor-ui/core';

export default function MenuDisabled() {
    return (
        <div className="flex flex-wrap gap-4">
            <Menu.Root>
                <Menu.Trigger>
                    <Button>일반 메뉴</Button>
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content>
                        <Menu.Item>활성 아이템 1</Menu.Item>
                        <Menu.Item disabled>비활성 아이템</Menu.Item>
                        <Menu.Item>활성 아이템 2</Menu.Item>
                        <Menu.Separator />
                        <Menu.Item disabled>비활성 아이템 2</Menu.Item>
                        <Menu.Item>활성 아이템 3</Menu.Item>
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>

            <Menu.Root disabled>
                <Menu.Trigger>
                    <Button>비활성 메뉴</Button>
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content>
                        <Menu.Item>아이템 1</Menu.Item>
                        <Menu.Item>아이템 2</Menu.Item>
                        <Menu.Item>아이템 3</Menu.Item>
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>
        </div>
    );
}