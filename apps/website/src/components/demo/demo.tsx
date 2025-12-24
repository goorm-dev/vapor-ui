'use client';

import * as React from 'react';

import { Box, Card, Tabs } from '@vapor-ui/core';
import { PcOutlineIcon, PhoneIcon, TabletIcon } from '@vapor-ui/icons';

import { DEVICE_TYPES, type DeviceType, TAB_TYPES, type TabType } from '~/constants/code-block';

import { ButtonToggleGroup } from '../button-toggle-group';
import ErrorBoundary from './error-boundary';
import { IframePreview } from './iframe-preview';
import { Preview } from './preview';

const isValidTabType = (value: string): value is TabType => {
    return Object.values(TAB_TYPES).includes(value as TabType);
};

const isValidDeviceType = (value: string): value is DeviceType => {
    return Object.values(DEVICE_TYPES).includes(value as DeviceType);
};

const useDemoState = () => {
    const [selectedDevice, setSelectedDevice] = React.useState<DeviceType>(DEVICE_TYPES.DESKTOP);
    const [selectedTab, setSelectedTab] = React.useState<TabType>(TAB_TYPES.PREVIEW);

    const handleTabChange = React.useCallback((value: string) => {
        if (isValidTabType(value)) {
            setSelectedTab(value);
        }
    }, []);

    const handleDeviceChange = React.useCallback((device: DeviceType) => {
        setSelectedDevice(device);
    }, []);

    return {
        selectedDevice,
        selectedTab,
        handleTabChange,
        handleDeviceChange,
    };
};

interface DemoHeaderProps {
    selectedTab: TabType;
    showResponsiveToggle: boolean;
    onDeviceChange: (device: DeviceType) => void;
}

const DemoHeader = ({ selectedTab, showResponsiveToggle, onDeviceChange }: DemoHeaderProps) => {
    const deviceItems = [
        {
            value: DEVICE_TYPES['DESKTOP'],
            label: <PcOutlineIcon size="16" />,
        },
        {
            value: DEVICE_TYPES['TABLET'],
            label: <TabletIcon size="16" />,
        },
        {
            value: DEVICE_TYPES['MOBILE'],
            label: <PhoneIcon size="16" />,
        },
    ];

    const shouldShowDeviceToggle = selectedTab === TAB_TYPES['PREVIEW'] && showResponsiveToggle;

    return (
        <Card.Header className="p-0 border-b-0 pt-v-50">
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
                    {Object.values(TAB_TYPES).map((tab) => (
                        <Tabs.Trigger key={tab} value={tab}>
                            {tab}
                        </Tabs.Trigger>
                    ))}
                    <Tabs.Indicator renderBeforeHydration />
                </Tabs.List>
                {shouldShowDeviceToggle && (
                    <ButtonToggleGroup
                        items={deviceItems}
                        defaultValue={DEVICE_TYPES['DESKTOP']}
                        onValueChange={(value) => {
                            if (isValidDeviceType(value)) {
                                onDeviceChange(value);
                            }
                        }}
                    />
                )}
            </Box>
        </Card.Header>
    );
};

interface DemoPreviewPanelProps {
    name: string;
    showResponsiveToggle: boolean;
    selectedDevice: DeviceType;
}

const DemoPreviewPanel = ({
    name,
    showResponsiveToggle,
    selectedDevice,
}: DemoPreviewPanelProps) => {
    if (showResponsiveToggle) {
        return <IframePreview name={name} device={selectedDevice} />;
    }

    return <Preview name={name} />;
};

interface DemoContentProps {
    name: string;
    children: React.ReactNode;
    selectedTab: TabType;
    selectedDevice: DeviceType;
    showResponsiveToggle: boolean;
    onTabChange: (value: string) => void;
    onDeviceChange: (device: DeviceType) => void;
}

const DemoContent = ({
    name,
    children,
    selectedTab,
    selectedDevice,
    showResponsiveToggle,
    onTabChange,
    onDeviceChange,
}: DemoContentProps) => {
    return (
        <Card.Root>
            <Tabs.Root
                value={selectedTab}
                onValueChange={onTabChange}
                className="w-full rounded-v-300"
                variant="plain"
                size="lg"
            >
                <DemoHeader
                    selectedTab={selectedTab}
                    showResponsiveToggle={showResponsiveToggle}
                    onDeviceChange={onDeviceChange}
                />

                <Card.Body className="p-0 bg-v-canvas rounded-b-v-300">
                    <Tabs.Panel value={TAB_TYPES['PREVIEW']} className="rounded-t-none" keepMounted>
                        <DemoPreviewPanel
                            name={name}
                            showResponsiveToggle={showResponsiveToggle}
                            selectedDevice={selectedDevice}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel
                        value="Code"
                        className="flex flex-col gap-v-250 rounded-t-none rounded-b-v-300 bg-v-normal"
                    >
                        {children}
                    </Tabs.Panel>
                </Card.Body>
            </Tabs.Root>
        </Card.Root>
    );
};

interface DemoProps {
    name: string;

    children?: React.ReactNode;
    showResponsiveToggle?: boolean;
}

export const Demo = (props: DemoProps) => {
    const { name, children, showResponsiveToggle = false } = props;
    const { selectedDevice, selectedTab, handleTabChange, handleDeviceChange } = useDemoState();

    if (!children) {
        return (
            <React.Suspense fallback={null}>
                <Preview name={name} />
            </React.Suspense>
        );
    }

    return (
        <ErrorBoundary>
            <DemoContent
                name={name}
                selectedTab={selectedTab}
                selectedDevice={selectedDevice}
                showResponsiveToggle={showResponsiveToggle}
                onTabChange={handleTabChange}
                onDeviceChange={handleDeviceChange}
            >
                {children}
            </DemoContent>
        </ErrorBoundary>
    );
};
