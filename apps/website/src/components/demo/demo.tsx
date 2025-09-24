'use client';

import * as React from 'react';

import { Box, Card, Tabs } from '@vapor-ui/core';
import { PcOutlineIcon, PhoneIcon, TabletIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { ButtonToggleGroup } from '../button-toggle-group';
import ErrorBoundary from './error-boundary';
import { Preview } from './preview';

interface DemoProps {
    name: string;

    children?: React.ReactNode;
    showResponsiveToggle?: boolean;
}

export function Demo(props: DemoProps) {
    const { name, children, showResponsiveToggle = false } = props;
    const [selectedDevice, setSelectedDevice] = React.useState('desktop');
    const [selectedTab, setSelectedTab] = React.useState<'Preview' | 'Code'>('Preview');

    if (!children) {
        return (
            <React.Suspense fallback={null}>
                <Preview name={name} />
            </React.Suspense>
        );
    }

    const getPreviewWidth = (device: string) => {
        switch (device) {
            case 'mobile':
                return 'w-[368px]';
            case 'tablet':
                return 'w-[768px]';
            case 'desktop':
            default:
                return 'w-full';
        }
    };

    return (
        <ErrorBoundary>
            <Card.Root>
                <Tabs.Root
                    value={selectedTab}
                    onValueChange={(value) => setSelectedTab(value as 'Preview' | 'Code')}
                    className="w-full rounded-[var(--vapor-size-borderRadius-300)]"
                    variant="plain"
                >
                    <Card.Header className="p-0 border-b-0 pt-[var(--vapor-size-space-050)]">
                        <Box
                            paddingY="$000"
                            paddingX="$300"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            gap="$050"
                            height={'$500'}
                        >
                            <Tabs.List>
                                {['Preview', 'Code'].map((tab) => (
                                    <Tabs.Trigger key={tab} value={tab}>
                                        {tab}
                                    </Tabs.Trigger>
                                ))}
                                <Tabs.Indicator renderBeforeHydration />
                            </Tabs.List>
                            {selectedTab === 'Preview' && showResponsiveToggle && (
                                <ButtonToggleGroup
                                    items={[
                                        {
                                            value: 'desktop',
                                            label: <PcOutlineIcon size="16" />,
                                        },
                                        {
                                            value: 'tablet',
                                            label: <TabletIcon size="16" />,
                                        },
                                        {
                                            value: 'mobile',
                                            label: <PhoneIcon size="16" />,
                                        },
                                    ]}
                                    defaultValue="desktop"
                                    onValueChange={setSelectedDevice}
                                />
                            )}
                        </Box>
                    </Card.Header>

                    <Card.Body className="p-0">
                        <Tabs.Panel value="Preview" className="rounded-t-none" keepMounted>
                            <Preview
                                name={name}
                                className={clsx(
                                    getPreviewWidth(selectedDevice),
                                    'mx-auto transition-all duration-200 p-[var(--vapor-size-space-300)]',
                                )}
                            />
                        </Tabs.Panel>
                        <Tabs.Panel
                            value="Code"
                            className="flex  flex-col gap-[var(--vapor-size-space-250)] rounded-t-none rounded-b-[var(--vapor-size-borderRadius-300)] bg-[var(--vapor-color-background-normal)]"
                        >
                            {children}
                        </Tabs.Panel>
                    </Card.Body>
                </Tabs.Root>
            </Card.Root>
        </ErrorBoundary>
    );
}
