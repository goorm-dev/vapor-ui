import { DirectionProvider } from '@base-ui-components/react';
import type { Meta } from '@storybook/react';

import { Menu } from './';

export default {
    title: 'Menu',
    component: Menu.Root,
} as Meta<typeof Menu.Root>;

export const Default = {
    render: () => (
        <DirectionProvider direction="ltr">
            <Menu.Root modal={true} align="start" side="bottom" sideOffset={8}>
                <Menu.Trigger>메뉴 열기</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content>
                        <Menu.Item disabled>항목 1</Menu.Item>
                        <Menu.Item>항목 2</Menu.Item>
                        <Menu.Item>항목 3</Menu.Item>
                        <Menu.Separator />
                        <Menu.SubmenuRoot disabled>
                            <Menu.SubmenuTriggerItem>서브 메뉴</Menu.SubmenuTriggerItem>
                            <Menu.SubmenuContent>
                                <Menu.Item disabled>서브 항목 1</Menu.Item>
                                <Menu.Item>서브 항목 2</Menu.Item>
                            </Menu.SubmenuContent>
                        </Menu.SubmenuRoot>
                        <Menu.Separator />
                        <Menu.Group>
                            <Menu.GroupLabel id="group-label">그룹 레이블</Menu.GroupLabel>
                            <Menu.Item>그룹 항목 1</Menu.Item>
                            <Menu.Item>그룹 항목 2</Menu.Item>
                        </Menu.Group>
                        <Menu.Separator />
                        <Menu.Group>
                            <Menu.GroupLabel>체크 항목</Menu.GroupLabel>
                            <Menu.CheckboxItem>미선택</Menu.CheckboxItem>
                            <Menu.CheckboxItem defaultChecked>선택</Menu.CheckboxItem>
                        </Menu.Group>
                        <Menu.Separator />
                        <Menu.Group>
                            <Menu.GroupLabel>라디오 항목</Menu.GroupLabel>
                            <Menu.RadioGroup defaultValue="선택">
                                <Menu.RadioItem value="not-selected">미선택</Menu.RadioItem>
                                <Menu.RadioItem value="selected">선택</Menu.RadioItem>
                            </Menu.RadioGroup>
                        </Menu.Group>
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>
        </DirectionProvider>
    ),
};

export const TestBed = {
    render: () => (
        <Menu.Root open modal={true} align="start" side="bottom" sideOffset={8}>
            <Menu.Trigger>메뉴 열기</Menu.Trigger>
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Item disabled>항목 1</Menu.Item>
                    <Menu.Item>항목 2</Menu.Item>
                    <Menu.Item>항목 3</Menu.Item>
                    <Menu.Separator />
                    <Menu.SubmenuRoot open>
                        <Menu.SubmenuTriggerItem>서브 메뉴</Menu.SubmenuTriggerItem>
                        <Menu.Portal>
                            <Menu.SubmenuContent>
                                <Menu.Item disabled>서브 항목 1</Menu.Item>
                                <Menu.Item>서브 항목 2</Menu.Item>
                            </Menu.SubmenuContent>
                        </Menu.Portal>
                    </Menu.SubmenuRoot>
                    <Menu.Separator />
                    <Menu.Group>
                        <Menu.GroupLabel id="group-label">그룹 레이블</Menu.GroupLabel>
                        <Menu.Item>그룹 항목 1</Menu.Item>
                        <Menu.Item>그룹 항목 2</Menu.Item>
                        <Menu.CheckboxItem checked>미선택</Menu.CheckboxItem>
                        <Menu.CheckboxItem defaultChecked>선택</Menu.CheckboxItem>
                    </Menu.Group>
                    <Menu.Separator />
                    <Menu.Group>
                        <Menu.GroupLabel>체크 항목</Menu.GroupLabel>
                        <Menu.CheckboxItem>미선택</Menu.CheckboxItem>
                        <Menu.CheckboxItem defaultChecked>선택</Menu.CheckboxItem>
                    </Menu.Group>
                    <Menu.Separator />
                    <Menu.Group>
                        <Menu.GroupLabel>라디오 항목</Menu.GroupLabel>
                        <Menu.RadioGroup defaultValue="선택">
                            <Menu.RadioItem value="not-selected">미선택</Menu.RadioItem>
                            <Menu.RadioItem value="selected">선택</Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Group>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    ),
};
