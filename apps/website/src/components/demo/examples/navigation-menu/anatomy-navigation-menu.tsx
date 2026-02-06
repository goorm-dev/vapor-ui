'use client';

import { NavigationMenu, Text } from '@vapor-ui/core';

export default function AnatomyNavigationMenu() {
    return (
        <NavigationMenu.Root data-part="Root" aria-label="Navigation menu">
            <NavigationMenu.List data-part="List">
                <NavigationMenu.Item data-part="Item">
                    <NavigationMenu.Link data-part="Link" href="#">
                        Home
                    </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                    <NavigationMenu.Trigger data-part="Trigger">Products</NavigationMenu.Trigger>
                    <NavigationMenu.PortalPrimitive data-part="PortalPrimitive">
                        <NavigationMenu.PositionerPrimitive data-part="PositionerPrimitive">
                            <NavigationMenu.PopupPrimitive data-part="PopupPrimitive">
                                <NavigationMenu.ViewportPrimitive data-part="ViewportPrimitive">
                                    <NavigationMenu.Viewport data-part="Viewport">
                                        <NavigationMenu.Content data-part="Content">
                                            <Text typography="body2" foreground="normal-100">
                                                Products content area
                                            </Text>
                                        </NavigationMenu.Content>
                                    </NavigationMenu.Viewport>
                                </NavigationMenu.ViewportPrimitive>
                            </NavigationMenu.PopupPrimitive>
                        </NavigationMenu.PositionerPrimitive>
                    </NavigationMenu.PortalPrimitive>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
