import { useState } from 'react';

import { Button, HStack, SideNavigation, Text, VStack } from '@vapor-ui/core';
import { ChartOutlineIcon, DashboardOutlineIcon } from '@vapor-ui/icons';

export default function SideNavigationOpenState() {
    const [open, setOpen] = useState(true);

    return (
        <HStack $css={{ gap: '$400', alignItems: 'flex-start' }}>
            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    defaultOpen
                </Text>
                <SideNavigation.Root aria-label="Default open" className="w-72">
                    <SideNavigation.List>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger>
                                <DashboardOutlineIcon size={20} />
                                Dashboard
                            </SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">Usage</SideNavigation.SubLink>
                                </SideNavigation.Item>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">
                                        Billing
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>

                        <SideNavigation.Group>
                            <SideNavigation.Trigger>
                                <ChartOutlineIcon size={20} />
                                Reports
                            </SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">Weekly</SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>
                    </SideNavigation.List>
                </SideNavigation.Root>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    controlled
                </Text>
                <SideNavigation.Root aria-label="Controlled" className="w-72">
                    <SideNavigation.List>
                        <SideNavigation.Group open={open} onOpenChange={setOpen}>
                            <SideNavigation.Trigger>
                                <DashboardOutlineIcon size={20} />
                                Dashboard
                            </SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">Usage</SideNavigation.SubLink>
                                </SideNavigation.Item>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">
                                        Billing
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>
                    </SideNavigation.List>
                </SideNavigation.Root>

                <HStack $css={{ gap: '$100' }}>
                    <Button size="sm" onClick={() => setOpen(true)}>
                        Open
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </HStack>
            </VStack>
        </HStack>
    );
}
