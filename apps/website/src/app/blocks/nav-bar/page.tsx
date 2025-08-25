'use client';

import { Button, Card, Text } from '@vapor-ui/core';
import { ChevronLeftOutlineIcon } from '@vapor-ui/icons';
import Link from 'next/link';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

export default function NavBarBlockPage() {
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
                            Navigation Bar Blocks
                        </Text>
                        <Text typography="body1" foreground="secondary">
                            Responsive navigation bar components built with Vapor UI
                        </Text>
                    </div>

                    <div className="space-y-8">
                        {/* Basic Navigation Bar */}
                        <Card.Root>
                            <Card.Header>
                                <Text typography="heading3">Basic Navigation Bar</Text>
                                <Text typography="body2" foreground="secondary">
                                    A simple navigation bar with logo and menu items
                                </Text>
                            </Card.Header>
                            <Card.Body>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    {/* Preview of the current SiteNavBar */}
                                    <div className="relative">
                                        <SiteNavBar />
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
                                <Text typography="heading3">Minimal Navigation</Text>
                                <Text typography="body2" foreground="secondary">
                                    Clean and minimal navigation design
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
                                <Text typography="heading3">Navigation with Search</Text>
                                <Text typography="body2" foreground="secondary">
                                    Navigation bar with integrated search functionality
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
