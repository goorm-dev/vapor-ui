import { Button, Card, Nav, Text } from '@vapor-ui/core';
import { ChevronLeftOutlineIcon, HomeIcon, SettingOutlineIcon, UserIcon } from '@vapor-ui/icons';
import Link from 'next/link';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

export default function SideBarBlockPage() {
    return (
        <div>
            <SiteNavBar />
            <main className="pt-[62px]">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <Link href="/blocks">
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ChevronLeftOutlineIcon size={16} />
                                Back to Blocks
                            </Button>
                        </Link>

                        <Text typography="heading1" className="mb-2">
                            Side Bar Blocks
                        </Text>
                        <Text typography="body1" foreground="secondary">
                            Sidebar navigation components for applications and dashboards
                        </Text>
                    </div>

                    <div className="space-y-8">
                        {/* Basic Sidebar */}
                        <Card.Root>
                            <Card.Header>
                                <Text typography="heading3">Basic Sidebar</Text>
                                <Text typography="body2" foreground="secondary">
                                    A simple sidebar with navigation items
                                </Text>
                            </Card.Header>
                            <Card.Body>
                                <div className="border rounded-lg bg-gray-50 h-64 flex">
                                    <div className="w-64 bg-white border-r p-4">
                                        <Nav.Root aria-label="Sidebar navigation">
                                            <Nav.List className="space-y-2">
                                                <Nav.Item>
                                                    <Nav.Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
                                                        <HomeIcon size={20} />
                                                        <Text typography="body2">Dashboard</Text>
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
                                                        <UserIcon size={20} />
                                                        <Text typography="body2">Profile</Text>
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
                                                        <SettingOutlineIcon size={20} />
                                                        <Text typography="body2">Settings</Text>
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav.List>
                                        </Nav.Root>
                                    </div>
                                    <div className="flex-1 p-4 flex items-center justify-center">
                                        <Text typography="body2" foreground="secondary">
                                            Main Content Area
                                        </Text>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Button size="sm">View Code</Button>
                                </div>
                            </Card.Body>
                        </Card.Root>

                        {/* Coming Soon Blocks */}
                        <Card.Root>
                            <Card.Header>
                                <Text typography="heading3">Collapsible Sidebar</Text>
                                <Text typography="body2" foreground="secondary">
                                    Sidebar that can collapse to save space
                                </Text>
                            </Card.Header>
                            <Card.Body>
                                <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center h-24">
                                    <Text typography="body2" foreground="secondary">
                                        Coming Soon
                                    </Text>
                                </div>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root>
                            <Card.Header>
                                <Text typography="heading3">Multi-level Sidebar</Text>
                                <Text typography="body2" foreground="secondary">
                                    Sidebar with nested navigation items
                                </Text>
                            </Card.Header>
                            <Card.Body>
                                <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center h-24">
                                    <Text typography="body2" foreground="secondary">
                                        Coming Soon
                                    </Text>
                                </div>
                            </Card.Body>
                        </Card.Root>
                    </div>
                </div>
            </main>
        </div>
    );
}
