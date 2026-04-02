'use client';

import * as React from 'react';

import { Card, Tabs } from '@vapor-ui/core';
import { PcOutlineIcon, PhoneIcon, TabletIcon } from '@vapor-ui/icons';

import { DEVICE_TYPES, type DeviceType, TAB_TYPES, type TabType } from '~/constants/code-block';

import { ButtonToggleGroup } from '../button-toggle-group';
import ErrorBoundary from './error-boundary';
import { IframePreview } from './iframe-preview';
import { Preview } from './preview';

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
            <Card.Root
                render={
                    <Tabs.Root
                        value={selectedTab}
                        onValueChange={handleTabChange}
                        className="w-full rounded-v-300"
                        variant="line"
                        size="lg"
                    />
                }
            >
                <Card.Header className="p-0 border-b-0 pt-v-50 bg-v-canvas-100 rounded-t-v-300 relative @container">
                    <DemoHeader
                        selectedTab={selectedTab}
                        selectedDevice={selectedDevice}
                        showResponsiveToggle={showResponsiveToggle}
                        onDeviceChange={handleDeviceChange}
                    />
                </Card.Header>

                <Card.Body className="p-0 bg-v-canvas rounded-b-v-300 overflow-hidden">
                    <Tabs.Panel value={TAB_TYPES['PREVIEW']} className="rounded-t-none" keepMounted>
                        <DemoPreviewPanel
                            name={name}
                            showResponsiveToggle={showResponsiveToggle}
                            selectedDevice={selectedDevice}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel
                        value={TAB_TYPES['CODE']}
                        className="flex flex-col gap-v-250 rounded-t-none rounded-b-v-300 bg-v-normal [&>figure]:m-0 [&>figure]:border-0 [&>figure]:rounded-none [&>figure:last-child]:rounded-b-v-300"
                    >
                        {children}
                    </Tabs.Panel>
                </Card.Body>
            </Card.Root>
        </ErrorBoundary>
    );
};

/* -----------------------------------------------------------------------------------------------*/

const isValidTabType = (value: string): value is TabType => {
    return Object.values(TAB_TYPES).includes(value as TabType);
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

/* -----------------------------------------------------------------------------------------------*/

interface DemoHeaderProps {
    selectedTab: TabType;
    selectedDevice: DeviceType;
    showResponsiveToggle: boolean;
    onDeviceChange: (device: DeviceType) => void;
}

const DemoHeader = ({
    selectedTab,
    selectedDevice,
    showResponsiveToggle,
    onDeviceChange,
}: DemoHeaderProps) => {
    const shouldShowDeviceToggle = selectedTab === TAB_TYPES['PREVIEW'] && showResponsiveToggle;

    return (
        <>
            <Tabs.List $css={{ width: '100%', paddingInline: '$300' }}>
                {Object.values(TAB_TYPES).map((tab) => (
                    <Tabs.Button key={tab} value={tab}>
                        {tab}
                    </Tabs.Button>
                ))}
            </Tabs.List>

            {shouldShowDeviceToggle && (
                <ButtonToggleGroup
                    items={deviceItems}
                    defaultValue={selectedDevice}
                    onValueChange={(value) => {
                        if (isValidDeviceType(value)) {
                            onDeviceChange(value);
                        }
                    }}
                />
            )}
        </>
    );
};

const isValidDeviceType = (value: string): value is DeviceType => {
    return Object.values(DEVICE_TYPES).includes(value as DeviceType);
};

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

/* -----------------------------------------------------------------------------------------------*/

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
