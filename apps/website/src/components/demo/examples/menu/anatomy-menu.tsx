'use client';

import { Button, Menu } from '@vapor-ui/core';

export default function AnatomyMenu() {
    return (
        <Menu.Root data-part="Root">
            <Menu.Trigger data-part="Trigger" render={<Button>Open Menu</Button>} />
            <Menu.PortalPrimitive data-part="PortalPrimitive">
                <Menu.PositionerPrimitive
                    data-part="PositionerPrimitive"
                    side="right"
                    align="center"
                >
                    <Menu.PopupPrimitive data-part="PopupPrimitive">
                        <Menu.Group data-part="Group">
                            <Menu.GroupLabel data-part="GroupLabel">File</Menu.GroupLabel>
                            <Menu.Item data-part="Item">New File</Menu.Item>
                            <Menu.Item>Open File</Menu.Item>
                        </Menu.Group>
                        <Menu.Separator data-part="Separator" />
                        <Menu.CheckboxItemPrimitive data-part="CheckboxItemPrimitive">
                            <Menu.CheckboxItem data-part="CheckboxItem">
                                <Menu.CheckboxItemIndicatorPrimitive data-part="CheckboxItemIndicatorPrimitive" />
                                Auto Save
                            </Menu.CheckboxItem>
                        </Menu.CheckboxItemPrimitive>
                        <Menu.Separator />
                        <Menu.RadioGroup data-part="RadioGroup" defaultValue="light">
                            <Menu.RadioItemPrimitive data-part="RadioItemPrimitive" value="light">
                                <Menu.RadioItem data-part="RadioItem" value="light">
                                    <Menu.RadioItemIndicatorPrimitive data-part="RadioItemIndicatorPrimitive" />
                                    Light
                                </Menu.RadioItem>
                            </Menu.RadioItemPrimitive>
                            <Menu.RadioItemPrimitive value="dark">
                                <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
                            </Menu.RadioItemPrimitive>
                        </Menu.RadioGroup>
                        <Menu.Separator />
                        <Menu.SubmenuRoot data-part="SubmenuRoot">
                            <Menu.SubmenuTriggerItem data-part="SubmenuTriggerItem">
                                Export
                            </Menu.SubmenuTriggerItem>
                            <Menu.SubmenuPopup data-part="SubmenuPopup">
                                <Menu.Item>PDF</Menu.Item>
                                <Menu.Item>CSV</Menu.Item>
                            </Menu.SubmenuPopup>
                        </Menu.SubmenuRoot>
                    </Menu.PopupPrimitive>
                </Menu.PositionerPrimitive>
            </Menu.PortalPrimitive>
        </Menu.Root>
    );
}
