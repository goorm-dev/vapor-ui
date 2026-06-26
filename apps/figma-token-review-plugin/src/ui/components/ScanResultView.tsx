import { useState } from 'react';

import type { ScanPayload } from '~/shared/schema';

import { TabHeader } from './TabHeader';
import { ViolationList } from './ViolationList';

type Tab = 'color' | 'typography';

type Props = {
    payload: ScanPayload;
};

export function ScanResultView({ payload }: Props) {
    const [tab, setTab] = useState<Tab>('color');

    return (
        <>
            <TabHeader
                active={tab}
                colorCount={payload.color.violations.length}
                typographyCount={payload.typography.violations.length}
                onChange={setTab}
            />
            <ViolationList violations={payload[tab].violations} summary={payload[tab].summary} />
        </>
    );
}
