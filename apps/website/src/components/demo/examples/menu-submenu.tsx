"use client";

import { Button, Menu } from '@vapor-ui/core';

export default function MenuSubmenu() {
    return (
        <Menu.Root>
            <Menu.Trigger render={<Button>서브메뉴</Button>} />
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Item>새 파일</Menu.Item>
                    <Menu.Item>파일 열기</Menu.Item>
                    <Menu.Separator />
                    
                    <Menu.SubmenuRoot>
                        <Menu.SubmenuTriggerItem>
                            최근 파일
                        </Menu.SubmenuTriggerItem>
                        <Menu.Portal>
                            <Menu.SubmenuContent>
                                <Menu.Item>document.txt</Menu.Item>
                                <Menu.Item>presentation.pptx</Menu.Item>
                                <Menu.Item>spreadsheet.xlsx</Menu.Item>
                                <Menu.Separator />
                                <Menu.Item>더 많은 파일...</Menu.Item>
                            </Menu.SubmenuContent>
                        </Menu.Portal>
                    </Menu.SubmenuRoot>

                    <Menu.SubmenuRoot>
                        <Menu.SubmenuTriggerItem>
                            내보내기
                        </Menu.SubmenuTriggerItem>
                        <Menu.Portal>
                            <Menu.SubmenuContent>
                                <Menu.Item>PDF로 내보내기</Menu.Item>
                                <Menu.Item>이미지로 내보내기</Menu.Item>
                                <Menu.Item>HTML로 내보내기</Menu.Item>
                            </Menu.SubmenuContent>
                        </Menu.Portal>
                    </Menu.SubmenuRoot>
                    
                    <Menu.Separator />
                    <Menu.Item>종료</Menu.Item>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}