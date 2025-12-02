'use client';

import { Button, Menu } from '@vapor-ui/core';

export default function MenuPositioning() {
    return (
        <div className="flex flex-wrap gap-4">
            <Menu.Root>
                <Menu.Trigger render={<Button>상단 메뉴</Button>} />
                <Menu.PortalPrimitive>
                    <Menu.PositionerPrimitive side="top">
                        <Menu.PopupPrimitive>
                            <Menu.Item>상단 아이템 1</Menu.Item>
                            <Menu.Item>상단 아이템 2</Menu.Item>
                            <Menu.Item>상단 아이템 3</Menu.Item>
                        </Menu.PopupPrimitive>
                    </Menu.PositionerPrimitive>
                </Menu.PortalPrimitive>
            </Menu.Root>

            <Menu.Root>
                <Menu.Trigger render={<Button>우측 메뉴</Button>} />
                <Menu.PortalPrimitive>
                    <Menu.PositionerPrimitive side="right">
                        <Menu.PopupPrimitive>
                            <Menu.Item>우측 아이템 1</Menu.Item>
                            <Menu.Item>우측 아이템 2</Menu.Item>
                            <Menu.Item>우측 아이템 3</Menu.Item>
                        </Menu.PopupPrimitive>
                    </Menu.PositionerPrimitive>
                </Menu.PortalPrimitive>
            </Menu.Root>

            <Menu.Root>
                <Menu.Trigger render={<Button>하단 메뉴</Button>} />
                <Menu.PortalPrimitive>
                    <Menu.PositionerPrimitive side="bottom">
                        <Menu.PopupPrimitive>
                            <Menu.Item>하단 아이템 1</Menu.Item>
                            <Menu.Item>하단 아이템 2</Menu.Item>
                            <Menu.Item>하단 아이템 3</Menu.Item>
                        </Menu.PopupPrimitive>
                    </Menu.PositionerPrimitive>
                </Menu.PortalPrimitive>
            </Menu.Root>

            <Menu.Root>
                <Menu.Trigger render={<Button>좌측 메뉴</Button>} />
                <Menu.PortalPrimitive>
                    <Menu.PositionerPrimitive side="left">
                        <Menu.PopupPrimitive>
                            <Menu.Item>좌측 아이템 1</Menu.Item>
                            <Menu.Item>좌측 아이템 2</Menu.Item>
                            <Menu.Item>좌측 아이템 3</Menu.Item>
                        </Menu.PopupPrimitive>
                    </Menu.PositionerPrimitive>
                </Menu.PortalPrimitive>
            </Menu.Root>
        </div>
    );
}
