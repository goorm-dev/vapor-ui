import type { Property } from '~/common/schemas';
import legacyRaw from '~/common/tokens/legacy-color.json';

/**
 * 레거시 vapor 컬러 → v1_0_0 신규 토큰 매핑.
 *
 * JSON 소스: `common/tokens/legacy-color.json`.
 * 각 엔트리는 { type, oldName, oldValue, v1_0_0, section }.
 *   - type "변경" | "삭제" | "추가"
 *   - v1_0_0 값이 "-" 로 시작하면 신규 매핑 없음 (추천 없음)
 *   - oldName / oldValue 가 "-" 이면 신규 전용 항목 (역참조 대상 아님)
 */

export type LegacyColorEntry = {
    type: string;
    oldName: string;
    oldValue: string;
    v1_0_0: string;
    section: string;
};

export type LegacyRole = 'background' | 'foreground' | 'border' | null;

/** v1_0_0 값에서 실제 신규 토큰 키만 추출.
 *  "-" 로 시작하면 매핑 없음.
 *  "color-white로 대체" 처럼 뒤에 한글 설명이 붙은 경우 앞의 토큰만 반환.
 */
function normalizeNewToken(v: string): string | null {
    if (!v) return null;
    if (v.trim().startsWith('-')) return null;
    const match = v.match(/^([a-z][a-z0-9-]*)/);
    return match ? match[1] : null;
}

/** rgb / rgba 문자열 → #rrggbb (alpha 무시).
 *  "rgb(42, 114, 229)" / "rgba(42, 114, 229, 0.08)" 지원.
 *  "-" 같은 sentinel 은 null.
 */
function rgbStringToHex(v: string): string | null {
    if (!v || v === '-') return null;
    const m = v.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return null;
    const toHex = (n: string) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0');
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
}

function roleOfNewToken(newToken: string): LegacyRole {
    if (newToken.startsWith('color-background-')) return 'background';
    if (newToken.startsWith('color-foreground-')) return 'foreground';
    if (newToken.startsWith('color-border-')) return 'border';
    return null;
}

/** property → 필수 매칭 role. 매칭되지 않는 새 토큰은 오히려 오해를 유발하므로 제안 안 함. */
function requiredRoleForProperty(property: Property): LegacyRole {
    if (property === 'fill') return 'background';
    if (property === 'fill-on-text') return 'foreground';
    if (property === 'stroke') return 'border';
    return null;
}

export type LegacyColorSchema = {
    /** oldName → v1_0_0 신규 토큰 (매핑 없는 항목 제외). */
    byOldName: Map<string, string>;
    /** #rrggbb → 후보 신규 토큰 리스트 (같은 hex 가 여러 role 에 재사용될 수 있음). */
    byHex: Map<string, Array<{ token: string; role: LegacyRole }>>;
};

let cached: LegacyColorSchema | null = null;

export function loadLegacyColorSchema(): LegacyColorSchema {
    if (cached) return cached;

    const byOldName = new Map<string, string>();
    const byHex = new Map<string, Array<{ token: string; role: LegacyRole }>>();

    for (const entry of legacyRaw as LegacyColorEntry[]) {
        const newToken = normalizeNewToken(entry.v1_0_0);
        if (!newToken) continue;

        if (entry.oldName && entry.oldName !== '-' && !byOldName.has(entry.oldName)) {
            byOldName.set(entry.oldName, newToken);
        }

        const hex = rgbStringToHex(entry.oldValue);
        if (hex) {
            const key = hex.toLowerCase();
            const arr = byHex.get(key) ?? [];
            arr.push({ token: newToken, role: roleOfNewToken(newToken) });
            byHex.set(key, arr);
        }
    }

    cached = { byOldName, byHex };
    return cached;
}

/**
 * 스캔된 컬러가 레거시일 경우 신규 토큰 제안.
 *
 * 규칙:
 *  1. token 이름이 레거시 oldName 과 정확히 일치 → 해당 신규 토큰 (role 검사 후 반환).
 *  2. 아니면 hex 로 찾되 property scope 에 맞는 role 인 후보만 반환.
 *  3. role 이 property 와 안 맞으면 null. (fill 에 foreground 신규 토큰 제안은 오히려 오해)
 *
 * 매핑 없으면 null (UI 에서 "추천 없음" 표시).
 */
export function suggestLegacyReplacement(input: {
    token: string | null;
    hex: string | null;
    property: Property;
}): string | null {
    const schema = loadLegacyColorSchema();
    const requiredRole = requiredRoleForProperty(input.property);

    const matchesRole = (newToken: string): boolean => {
        if (!requiredRole) return true;
        return roleOfNewToken(newToken) === requiredRole;
    };

    if (input.token) {
        const byName = schema.byOldName.get(input.token);
        if (byName && matchesRole(byName)) return byName;
    }

    if (input.hex) {
        const candidates = schema.byHex.get(input.hex.toLowerCase()) ?? [];
        const match = candidates.find((c) => (requiredRole ? c.role === requiredRole : true));
        if (match) return match.token;
    }

    return null;
}
