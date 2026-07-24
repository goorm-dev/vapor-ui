/* eslint-disable @typescript-eslint/no-explicit-any -- Variable alias chains + valuesByMode lookups are intentionally untyped. */
import type { SchemaMode, TokenStatus } from '~/common/schemas';

import { rgbaToHex } from './paint';

export type TierChainEntry = { name: string; tier: string };

/** 콜렉션 이름의 이모지/서명 prefix 로 tier 판정. */
function tierOf(collName: string | null): string {
    if (!collName) return 'unknown';
    if (collName.includes('⚙️') || /primitive/i.test(collName)) return 'primitive';
    if (collName.includes('●') || /(^|[^a-z])token(\/|$| )/i.test(collName)) return 'semantic';
    if (collName.includes('💙') || /\/Color$/i.test(collName)) return 'component';

    return 'unknown';
}

/** semantic 계층에 도달한 이름을 스키마 키로 변환. `color-` 로 시작하지 않으면 null. */
function toSchemaKey(name: string | null): string | null {
    return name && name.startsWith('color-') ? name : null;
}

/**
 * Figma 변수/스타일 이름에서 선두 `<prefix>/` 를 제거.
 *   "size/size-space-200"                    → "size-space-200"
 *   "color/color-background-primary-100"     → "color-background-primary-100"
 *   "shadow/shadow-md"                       → "shadow-md"
 *   "already-clean-200"                      → "already-clean-200"
 */
function stripLeadingPrefix(name: string): string {
    const idx = name.indexOf('/');
    return idx === -1 ? name : name.substring(idx + 1);
}

/**
 * remote 변수 안전 조회. team library import 실패 시 원본 반환.
 * 실패한 체인은 downstream 에서 'unknown' 으로 떨어진다.
 */
async function getVariableWithRemoteDefense(id: string): Promise<any> {
    let v: any = null;

    try {
        v = await figma.variables.getVariableByIdAsync(id);
    } catch (_e) {
        v = null;
    }

    if (v && v.remote) {
        try {
            const imported = await figma.variables.importVariableByKeyAsync(v.key);
            if (imported) v = imported;
        } catch (_e) {
            /* 원본 유지 */
        }
    }

    return v;
}

/**
 * 변수 별칭 체인을 끝까지 추적하며 [(name, tier)...] 를 만들고
 * 최종 hex 도 함께 반환. seen guard 로 무한 참조 방지.
 */
export async function walk(
    node: SceneNode,
    startId: string,
): Promise<{ chain: TierChainEntry[]; finalHex: string | null }> {
    const modes: Record<string, string> = (node as any).resolvedVariableModes || {};
    const chain: TierChainEntry[] = [];
    const seen = new Set<string>();
    let id: string | null = startId;
    let finalHex: string | null = null;

    while (id && !seen.has(id)) {
        seen.add(id);

        const v = await getVariableWithRemoteDefense(id);
        if (!v) break;

        let collName: string | null = null;

        try {
            const coll = await figma.variables.getVariableCollectionByIdAsync(
                v.variableCollectionId,
            );

            collName = coll && coll.name;
        } catch (_e) {
            collName = null;
        }
        chain.push({ name: v.name, tier: tierOf(collName) });

        const m = modes[v.variableCollectionId] || Object.keys(v.valuesByMode)[0];
        const val = v.valuesByMode[m];

        if (val && val.type === 'VARIABLE_ALIAS') {
            id = val.id;
        } else {
            finalHex = rgbaToHex(val);
            id = null;
        }
    }

    return { chain, finalHex };
}

/** semantic 항목까지 도달했으면 스키마 키 반환. 없으면 unknown. */
export function toToken(chain: TierChainEntry[]): {
    token: string | null;
    tokenStatus: TokenStatus;
} {
    const sem = chain.find((c) => c.tier === 'semantic');
    if (!sem) return { token: null, tokenStatus: 'unknown' };

    const key = toSchemaKey(sem.name);
    return key ? { token: key, tokenStatus: 'ok' } : { token: null, tokenStatus: 'unknown' };
}

/** boundVariables 의 단일 필드 → 토큰 키. 바인딩 없으면 'raw'. */
export async function readBoundToken(
    bound: Record<string, { id: string }> | undefined,
    field: string,
): Promise<{ token: string | null; status: TokenStatus }> {
    const ref = bound?.[field];
    if (!ref) return { token: null, status: 'raw' };

    const variable = await getVariableWithRemoteDefense(ref.id);
    if (!variable) return { token: null, status: 'unknown' };

    return { token: stripLeadingPrefix(variable.name), status: 'ok' };
}

/**
 * shadow 는 effect-style 레벨에서 바인딩되므로 effectStyleId 로 토큰을 도출.
 * per-effect boundVariables 는 사용하지 않음.
 */
export async function readEffectStyleToken(
    node: SceneNode,
): Promise<{ token: string | null; status: TokenStatus }> {
    const styleId: string | undefined = (node as any).effectStyleId;
    if (!styleId) return { token: null, status: 'raw' };

    try {
        const style = await figma.getStyleByIdAsync(styleId);
        if (!style) return { token: null, status: 'unknown' };

        return { token: stripLeadingPrefix(style.name), status: 'ok' };
    } catch (_e) {
        return { token: null, status: 'unknown' };
    }
}

/** 노드가 참조하는 변수 콜렉션 중 mode 이름이 "dark" 를 포함하면 dark 스키마. */
export async function detectSchemaMode(node: SceneNode): Promise<SchemaMode> {
    const modes: Record<string, string> = (node as any).resolvedVariableModes || {};

    for (const collId of Object.keys(modes)) {
        try {
            const coll = await figma.variables.getVariableCollectionByIdAsync(collId);
            const m = coll && coll.modes.find((x: any) => x.modeId === modes[collId]);

            if (m && /dark/i.test(m.name)) return 'dark';
        } catch (_e) {
            /* light 로 폴백 */
        }
    }

    return 'light';
}
