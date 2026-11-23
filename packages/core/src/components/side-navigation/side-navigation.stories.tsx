import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartOutlineIcon, DashboardOutlineIcon, SettingOutlineIcon } from '@vapor-ui/icons';

import { SideNavigation } from '.';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'SideNavigation',
    component: SideNavigation.Root,
    argTypes: {
        disabled: { control: { type: 'boolean' } },
    },
} satisfies Meta<typeof SideNavigation.Root>;

export const Default: StoryObj<typeof SideNavigation.Root> = {
    render: (args) => (
        <SideNavigation.Root aria-label="Service" $css={{ width: '284px' }} {...args}>
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
    ),
};

export const TestBed: StoryObj<typeof SideNavigation.Root> = {
    render: () => (
        <HStack $css={{ padding: '$200', gap: '$400', alignItems: 'start' }}>
            <VStack $css={{ gap: '$100', width: '284px' }}>
                <SideNavigation.Root aria-label="Default">
                    <SideNavigation.List>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger>
                                <DashboardOutlineIcon size={20} />
                                Open group
                            </SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">
                                        Sub link
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#" current>
                                        Current sub link
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#" disabled>
                                        Disabled sub link
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#" current disabled>
                                        Disabled current sub link
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>

                        <SideNavigation.Group>
                            <SideNavigation.Trigger>
                                <ChartOutlineIcon size={20} />
                                Closed group
                            </SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">
                                        Sub link
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>

                        <SideNavigation.Group>
                            <SideNavigation.Trigger disabled>
                                <ChartOutlineIcon size={20} />
                                Disabled group
                            </SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">
                                        Sub link
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>

                        <SideNavigation.Item>
                            <SideNavigation.Link href="#">
                                <SettingOutlineIcon size={20} />
                                Link
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="#" current>
                                <SettingOutlineIcon size={20} />
                                Current link
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="#" disabled>
                                <SettingOutlineIcon size={20} />
                                Disabled link
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="#" current disabled>
                                <SettingOutlineIcon size={20} />
                                Disabled current link
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>
            </VStack>

            <VStack $css={{ gap: '$100', width: '284px' }}>
                <SideNavigation.Root aria-label="Disabled" disabled>
                    <SideNavigation.List>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger>
                                <DashboardOutlineIcon size={20} />
                                Disabled root
                            </SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#">
                                        Sub link
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="#" disabled={false}>
                                        Enabled sub link
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>

                        <SideNavigation.Item>
                            <SideNavigation.Link href="#" current>
                                <SettingOutlineIcon size={20} />
                                Current link
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="#" disabled={false}>
                                <SettingOutlineIcon size={20} />
                                Enabled link
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>
            </VStack>
        </HStack>
    ),
};
