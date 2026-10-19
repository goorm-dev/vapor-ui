'use client';

import * as React from 'react';

import { Card, Tabs } from '@vapor-ui/core';

import { DEVICE_TYPES, type DeviceType, TAB_TYPES, type TabType } from './constants';
import { ErrorBoundary } from './error-boundary';
import { IframePreview } from './iframe-preview';
import { Preview } from './preview';
import { ResponsiveControl } from './responsive-control';

interface DemoProps {
    /** Example file path, absolute from the Next.js app root (`apps/website/`), ending in
     *  `.tsx` — e.g. `/content/docs/components/(components)/button/default-button.tsx`.
     *  Preview, iframe preview and the Code tab all resolve from this single value — a
     *  `remark-demo-source` plugin injects the Code tab's `doc-gen:file` block at MDX
     *  build time, so authors never set the path twice. */
    file: string;
    children?: React.ReactNode;
    showResponsiveToggle?: boolean;
}

export const Demo = ({ file, children, showResponsiveToggle = false }: DemoProps) => {
    const { selectedDevice, selectedTab, handleTabChange, handleDeviceChange } = useDemoState();

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
                    <DemoPreviewPanel
                        file={file}
                        showResponsiveToggle={showResponsiveToggle}
                        selectedDevice={selectedDevice}
                    />
                    <DemoCodePanel>{children}</DemoCodePanel>
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
    const shouldShowDeviceToggle = selectedTab === TAB_TYPES.PREVIEW && showResponsiveToggle;

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
                <ResponsiveControl defaultValue={selectedDevice} onValueChange={onDeviceChange} />
            )}
        </>
    );
};

/* -----------------------------------------------------------------------------------------------*/

interface DemoPreviewPanelProps {
    file: string;
    showResponsiveToggle: boolean;
    selectedDevice: DeviceType;
}

const DemoPreviewPanel = ({
    file,
    showResponsiveToggle,
    selectedDevice,
}: DemoPreviewPanelProps) => {
    const children = showResponsiveToggle ? (
        <IframePreview file={file} device={selectedDevice} />
    ) : (
        <Preview file={file} />
    );

    return (
        <Tabs.Panel value={TAB_TYPES.PREVIEW} className="rounded-t-none" keepMounted>
            {children}
        </Tabs.Panel>
    );
};

/* -----------------------------------------------------------------------------------------------*/

interface DemoCodePanelProps {
    children: React.ReactNode;
}

const DemoCodePanel = ({ children }: DemoCodePanelProps) => {
    return (
        <Tabs.Panel
            value={TAB_TYPES.CODE}
            className="flex flex-col gap-v-250 rounded-t-none rounded-b-v-300 bg-v-normal [&>figure]:m-0 [&>figure]:border-0 [&>figure]:rounded-none [&>figure:last-child]:rounded-b-v-300"
        >
            {children}
        </Tabs.Panel>
    );
};
