import { useState } from 'react';

import { Badge, Collapsible, HStack, IconButton, Tabs, Text, VStack } from '@vapor-ui/core';
import { ChevronUpOutlineIcon, RefreshOutlineIcon, UppercaseIcon } from '@vapor-ui/icons';

import type { EvaluateOutput, ScanPayload, Violation } from '~/shared/schema';

import { EmptyState } from './states/empty';
import { ViolationCard } from './violation-card';

type TabKey = 'color' | 'typography' | 'space' | 'dimension' | 'radius';

const FRAME_TAB_KEYS: TabKey[] = ['color', 'typography'];

const TAB_LABEL: Record<TabKey, string> = {
    color: 'Color',
    typography: 'Typography',
    space: 'Space',
    dimension: 'Dimension',
    radius: 'Border Radius',
};

type Props = {
    frameName: string;
    payload: ScanPayload;
};

function weight(v: Violation): number {
    return v.count ?? v.nodeIds?.length ?? 1;
}

function sortViolations(violations: Violation[]): Violation[] {
    return [...violations].sort((a, b) => {
        if (a.severity === b.severity) return weight(b) - weight(a);
        return a.severity === 'high' ? -1 : 1;
    });
}

function FrameHashIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <path
                d="M7 3v14M13 3v14M3 7h14M3 13h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

type SectionProps = {
    icon: 'frame' | 'text';
    title: string;
    violations: Violation[];
};

function Section({ icon, title, violations }: SectionProps) {
    if (violations.length === 0) return null;

    return (
        <Collapsible.Root defaultOpen className="group" $css={{ width: '100%' }}>
            <Collapsible.Trigger
                $css={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    color: '$fg-hint-100',
                }}
            >
                <HStack $css={{ alignItems: 'center', gap: '$100', color: '$fg-normal-200' }}>
                    {icon === 'frame' ? <FrameHashIcon /> : <UppercaseIcon size="20" />}
                    <Text typography="subtitle1" foreground="normal-200">
                        {title}
                    </Text>
                </HStack>
                <ChevronUpOutlineIcon
                    size="16"
                    className="transition-transform duration-200 group-data-[panel-open=false]:rotate-180"
                />
            </Collapsible.Trigger>
            <Collapsible.Panel>
                <VStack $css={{ gap: '$150', width: '100%', paddingTop: '$150' }}>
                    {violations.map((v, i) => (
                        <ViolationCard key={`${v.nodeId}-${i}`} violation={v} />
                    ))}
                </VStack>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
}

function isTextViolation(v: Violation): boolean {
    return v.type === 'fg-grade-mismatch' || v.type === 'fg-grade-ambiguous';
}

type TabContentProps = {
    violations: Violation[];
    summary: EvaluateOutput['summary'];
};

function TabContent({ violations, summary }: TabContentProps) {
    if (violations.length === 0) return <EmptyState summary={summary} />;

    const sorted = sortViolations(violations);
    const textOnes = sorted.filter(isTextViolation);
    const frameOnes = sorted.filter((v) => !isTextViolation(v));

    return (
        <VStack $css={{ gap: '$300', width: '100%', flex: 1, padding: '$200' }}>
            <Section icon="frame" title="Frame" violations={frameOnes} />
            <Section icon="text" title="Text" violations={textOnes} />
        </VStack>
    );
}

export function ScanResultView({ frameName = '이름 없는 프레임', payload }: Props) {
    const [tab, setTab] = useState<TabKey>('color');

    const counts: Record<TabKey, number> = {
        color: payload.color.violations.length,
        typography: payload.typography.violations.length,
        space: 0,
        dimension: 0,
        radius: 0,
    };

    return (
        <Tabs.Root
            value={tab}
            onValueChange={(value) => setTab(value as TabKey)}
            variant="line"
            size="md"
            $css={{
                width: '100%',
                minHeight: '100vh',
                backgroundColor: '$bg-canvas-100',
            }}
        >
            <Tabs.List $css={{ paddingInline: '$250', paddingTop: '$150' }}>
                {(Object.keys(TAB_LABEL) as TabKey[]).map((key) => {
                    const enabled = FRAME_TAB_KEYS.includes(key);
                    const selected = enabled && key === tab;

                    return (
                        <Tabs.Button
                            key={key}
                            value={key}
                            disabled={!enabled}
                            $css={{ flexShrink: 0 }}
                        >
                            {TAB_LABEL[key]}
                            <Badge size="sm" colorPalette={selected ? 'primary' : 'hint'}>
                                {counts[key]}
                            </Badge>
                        </Tabs.Button>
                    );
                })}
            </Tabs.List>

            <VStack
                $css={{
                    gap: '$050',
                    width: '100%',
                    padding: '$200',
                    borderBottomWidth: '1px',
                    borderBottomStyle: 'solid',
                    borderBottomColor: '$border-normal',
                }}
            >
                <Text typography="subtitle2" foreground="hint-100">
                    선택한 프레임
                </Text>
                <HStack $css={{ alignItems: 'center', gap: '$050' }}>
                    <Text typography="heading5" foreground="normal-200">
                        {frameName}
                    </Text>
                    <IconButton
                        size="sm"
                        variant="ghost"
                        colorPalette="secondary"
                        aria-label="새로고침"
                    >
                        <RefreshOutlineIcon />
                    </IconButton>
                </HStack>
            </VStack>

            <Tabs.Panel value="color">
                <TabContent violations={payload.color.violations} summary={payload.color.summary} />
            </Tabs.Panel>
            <Tabs.Panel value="typography">
                <TabContent
                    violations={payload.typography.violations}
                    summary={payload.typography.summary}
                />
            </Tabs.Panel>
        </Tabs.Root>
    );
}
