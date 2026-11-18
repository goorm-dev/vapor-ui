import { fetchMe, parseFigmaUrl } from '~/figma';

import { version } from '../package.json';

const ENDPOINT = 'https://vapor-ui.goorm.io/api/figma-blueprint/usage';
const INTERNAL_DOMAIN = '@goorm.io';
const DEADLINE_MS = 1500;

export type Stage = 'catalog' | 'fetch' | 'blueprint';

export type Outcome =
    { outcome: 'ok' | 'unscorable' } | { outcome: 'error'; stage: Stage; status?: number };

type Usage = { fileKey: string; nodeId: string; version: string } & Outcome;

export interface UsageRun {
    done(outcome: Outcome): Promise<void>;
}

export function startUsage(url: string): UsageRun | undefined {
    const token = process.env.FIGMA_ACCESS_TOKEN;
    const optedOut = ['1', 'true'].includes(process.env.DO_NOT_TRACK?.toLowerCase() ?? '');
    if (optedOut || !token || !URL.canParse(url)) return;
    const { fileKey, nodeId } = parseFigmaUrl(url);
    if (!fileKey) return;

    const abort = new AbortController();
    const email = fetchMe(token, abort.signal).then(
        (me) => me.email,
        () => undefined,
    );

    return {
        async done(outcome) {
            const deadline = setTimeout(() => abort.abort(), DEADLINE_MS);
            try {
                if (!(await email)?.toLowerCase().endsWith(INTERNAL_DOMAIN)) return;
                const body: Usage = { fileKey, nodeId, version, ...outcome };
                await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: abort.signal,
                });
            } catch {
                // the run's output and exit code never depend on this record
            } finally {
                clearTimeout(deadline);
                // aborting closes the connection, which would otherwise keep the process alive after main resolves
                abort.abort();
            }
        },
    };
}
