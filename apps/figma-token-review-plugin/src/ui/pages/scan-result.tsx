import { useMemo, useState } from 'react';

import { Badge, Box, Collapsible, HStack, IconButton, Tabs, Text, VStack } from '@vapor-ui/core';
import { ChevronUpOutlineIcon, RefreshOutlineIcon, UppercaseIcon } from '@vapor-ui/icons';

import type { EvaluateOutput, ScanPayload, Violation } from '~/shared/schema';

import { ViolationCard } from '../components/violation-card';

type TabKey = 'color' | 'typography' | 'space' | 'dimension' | 'radius';

type Props = {
    frameName?: string;
    payload: ScanPayload;
};

export function ScanResultPage({ frameName = '이름 없는 프레임', payload }: Props) {
    const [tab, setTab] = useState<TabKey>('color');
    const counts = useMemo(() => getViolationCounts(payload), [payload]);

    return (
        <Tabs.Root
            value={tab}
            onValueChange={(value) => setTab(value as TabKey)}
            variant="line"
            size="md"
            $css={{ width: '100%', minHeight: '100vh', backgroundColor: '$bg-canvas-100' }}
        >
            <ScanTabBar selected={tab} counts={counts} />

            <SelectedFrameHeader frameName={frameName} />

            <Tabs.Panel value="color">
                <ViolationPanel
                    violations={payload.color.violations}
                    summary={payload.color.summary}
                />
            </Tabs.Panel>
            <Tabs.Panel value="typography">
                <ViolationPanel
                    violations={payload.typography.violations}
                    summary={payload.typography.summary}
                />
            </Tabs.Panel>
        </Tabs.Root>
    );
}

// ----- Tab bar -----

const FRAME_TAB_KEYS: TabKey[] = ['color', 'typography'];

const TAB_LABEL: Record<TabKey, string> = {
    color: 'Color',
    typography: 'Typography',
    space: 'Space',
    dimension: 'Dimension',
    radius: 'Border Radius',
};

type ScanTabBarProps = {
    selected: TabKey;
    counts: Record<TabKey, number>;
};

function ScanTabBar({ selected, counts }: ScanTabBarProps) {
    return (
        <Tabs.List $css={{ paddingInline: '$250', paddingTop: '$150' }}>
            {(Object.keys(TAB_LABEL) as TabKey[]).map((key) => {
                const enabled = FRAME_TAB_KEYS.includes(key);
                const isActive = enabled && selected === key;

                return (
                    <Tabs.Button
                        key={key}
                        value={key}
                        disabled={!FRAME_TAB_KEYS.includes(key)}
                        $css={{ flexShrink: 0 }}
                    >
                        {TAB_LABEL[key]}

                        <Badge size="sm" colorPalette={isActive ? 'primary' : 'hint'}>
                            {counts[key]}
                        </Badge>
                    </Tabs.Button>
                );
            })}
        </Tabs.List>
    );
}

function getViolationCounts(payload: ScanPayload): Record<TabKey, number> {
    return {
        color: payload.color.violations.length,
        typography: payload.typography.violations.length,
        space: 0,
        dimension: 0,
        radius: 0,
    };
}

// ----- Selected frame header -----

function SelectedFrameHeader({ frameName }: { frameName: string }) {
    return (
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
    );
}

// ----- Violation panel -----

type ViolationPanelProps = {
    violations: Violation[];
    summary: EvaluateOutput['summary'];
};

function ViolationPanel({ violations, summary }: ViolationPanelProps) {
    const { frameOnes, textOnes } = useMemo(
        () => splitByKind(sortViolations(violations)),
        [violations],
    );

    if (violations.length === 0) return <EmptyState summary={summary} />;

    return (
        <VStack $css={{ gap: '$300', width: '100%', flex: 1, padding: '$200' }}>
            <ViolationSection icon="frame" title="Frame" violations={frameOnes} />
            <ViolationSection icon="text" title="Text" violations={textOnes} />
        </VStack>
    );
}

function splitByKind(violations: Violation[]): {
    frameOnes: Violation[];
    textOnes: Violation[];
} {
    return {
        frameOnes: violations.filter((v) => !isTextViolation(v)),
        textOnes: violations.filter(isTextViolation),
    };
}

function isTextViolation(v: Violation): boolean {
    return v.type === 'fg-grade-mismatch' || v.type === 'fg-grade-ambiguous';
}

function sortViolations(violations: Violation[]): Violation[] {
    return [...violations].sort((a, b) => {
        if (a.severity === b.severity) return weight(b) - weight(a);
        return a.severity === 'high' ? -1 : 1;
    });
}

function weight(v: Violation): number {
    return v.count ?? v.nodeIds?.length ?? 1;
}

// ----- Violation section (collapsible group) -----

type ViolationSectionProps = {
    icon: 'frame' | 'text';
    title: string;
    violations: Violation[];
};

function ViolationSection({ icon, title, violations }: ViolationSectionProps) {
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
                <SectionHeader icon={icon} title={title} />
                <ChevronUpOutlineIcon
                    size="16"
                    className="transition-transform duration-200 group-data-[panel-open=false]:rotate-180"
                />
            </Collapsible.Trigger>
            <Collapsible.Panel>
                <ViolationList violations={violations} />
            </Collapsible.Panel>
        </Collapsible.Root>
    );
}

function SectionHeader({ icon, title }: { icon: 'frame' | 'text'; title: string }) {
    return (
        <HStack $css={{ alignItems: 'center', gap: '$100', color: '$fg-normal-200' }}>
            {icon === 'frame' ? <FrameHashIcon /> : <UppercaseIcon size="20" />}
            <Text typography="subtitle1" foreground="normal-200">
                {title}
            </Text>
        </HStack>
    );
}

function ViolationList({ violations }: { violations: Violation[] }) {
    return (
        <VStack $css={{ gap: '$150', width: '100%', paddingTop: '$150' }}>
            {violations.map((v, i) => (
                <ViolationCard key={`${v.nodeId}-${i}`} violation={v} />
            ))}
        </VStack>
    );
}

// ----- Empty state -----

function EmptyState({ summary }: { summary: EvaluateOutput['summary'] }) {
    return (
        <Box className="flex flex-col items-center gap-v-100 p-v-400">
            <Text typography="body2">위반 없음.</Text>
            <Text typography="body4" className="text-v-gray-600">
                검사 노드 총 {summary.total}개
            </Text>
        </Box>
    );
}

// ----- Icons -----

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
