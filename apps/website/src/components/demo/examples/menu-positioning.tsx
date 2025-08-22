"use client";

import { Button, Menu } from '@vapor-ui/core';

export default function MenuPositioning() {
    return (
        <div className="flex flex-wrap gap-4">
            <Menu.Root side="top">
                <Menu.Trigger>
                    <Button>상단 메뉴</Button>
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content>
                        <Menu.Item>상단 아이템 1</Menu.Item>
                        <Menu.Item>상단 아이템 2</Menu.Item>
                        <Menu.Item>상단 아이템 3</Menu.Item>
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>

            <Menu.Root side="right">
                <Menu.Trigger>
                    <Button>우측 메뉴</Button>
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content>
                        <Menu.Item>우측 아이템 1</Menu.Item>
                        <Menu.Item>우측 아이템 2</Menu.Item>
                        <Menu.Item>우측 아이템 3</Menu.Item>
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>

            <Menu.Root side="bottom">
                <Menu.Trigger>
                    <Button>하단 메뉴</Button>
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content>
                        <Menu.Item>하단 아이템 1</Menu.Item>
                        <Menu.Item>하단 아이템 2</Menu.Item>
                        <Menu.Item>하단 아이템 3</Menu.Item>
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>

            <Menu.Root side="left">
                <Menu.Trigger>
                    <Button>좌측 메뉴</Button>
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content>
                        <Menu.Item>좌측 아이템 1</Menu.Item>
                        <Menu.Item>좌측 아이템 2</Menu.Item>
                        <Menu.Item>좌측 아이템 3</Menu.Item>
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>
        </div>
    );
}