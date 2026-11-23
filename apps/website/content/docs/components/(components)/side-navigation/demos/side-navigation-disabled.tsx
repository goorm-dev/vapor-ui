import { HStack, SideNavigation, Text, VStack } from '@vapor-ui/core';
import { DashboardOutlineIcon, SettingOutlineIcon } from '@vapor-ui/icons';

export default function SideNavigationDisabled() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'flex-start' }}>
            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    each part
                </Text>
                <SideNavigation.Root aria-label="Each part" className="w-72">
                    <SideNavigation.List>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger disabled>
                                <DashboardOutlineIcon size={20} />
                                Dashboard
                            </SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#" disabled>
                                        Usage
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#" current disabled>
                                        Billing
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>

                        <SideNavigation.Item>
                            <SideNavigation.Link href="#" disabled>
                                <SettingOutlineIcon size={20} />
                                Settings
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    root
                </Text>
                <SideNavigation.Root aria-label="Root" disabled className="w-72">
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
                                    <SideNavigation.SubLink href="#" disabled={false}>
                                        Billing
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>

                        <SideNavigation.Item>
                            <SideNavigation.Link href="#">
                                <SettingOutlineIcon size={20} />
                                Settings
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>
            </VStack>
        </HStack>
    );
}
