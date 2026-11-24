import { SideNavigation } from '@vapor-ui/core';
import { ChartOutlineIcon, DashboardOutlineIcon, SettingOutlineIcon } from '@vapor-ui/icons';

export default function DefaultSideNavigation() {
    return (
        <SideNavigation.Root aria-label="Service" className="w-72">
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
                            <SideNavigation.SubLink href="#" current>
                                Billing
                            </SideNavigation.SubLink>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.SubLink href="#">Alerts</SideNavigation.SubLink>
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
                        <SideNavigation.Item>
                            <SideNavigation.SubLink href="#">Monthly</SideNavigation.SubLink>
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
    );
}
