// evaluate.mjs
// 2단: 색상 토큰 적법성 — 결정론 검사. LLM 없음.
//
// 결정론으로 답이 입력마다 고정돼야 하는 판정만 코드로 박는다. 의미 적합성(when/avoid를
// 맥락에 비추는 판정)은 3단 LLM의 몫이라 여기서 하지 않는다.
//
// 입력: extract.figma.js 반환 객체({ colors: Element[], ... }) 또는 Element 배열.
//   ColorElement {
//     nodeId, nodeIds?, count?   // 그룹핑된 요소면 nodeIds/count(가중치). 미지정 count=1.
//     name, property             // 'fill' | 'stroke' | 'text'
//     token: string | null       // 체인이 도달한 semantic 키(colors.X.Y). null이면 미바인딩 또는 미도달.
//     hex: string | null
//     tokenStatus: 'ok' | 'raw' | 'unknown'
//     background: { kind, hex } | null  // property==='text'일 때만. kind: white|other|transparent|ambiguous
//   }
//
// 출력: { violations, conformant, summary, rubric }
//   high(부적합) — raw 미바인딩 / do-not-use / 스키마 키 부재 / role 불일치 / fg-100 비순백.
//   info(중립) — 배경 모호(fg-grade-ambiguous).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { loadColorSchema } from './schema-loader.mjs';

// property가 전제하는 토큰 role. 불일치는 결정론 위반(예: foreground 토큰을 면 채움에 사용).
// stroke는 border/foreground 둘 다 정당할 수 있어 단정하지 않는다(role 검사 생략).
const ROLE_BY_PROPERTY = { fill: 'background', text: 'foreground' };

export function evaluate(elements, ruleset) {
    const semantic = ruleset.semantic ?? {};
    const tokenKeys = ruleset.tokenKeys ? new Set(ruleset.tokenKeys) : null;

    const violations = [];
    const conformant = [];
    let totalWeight = 0;
    let conformWeight = 0;
    let hardViolatedWeight = 0;

    for (const el of elements) {
        const weight = el.count ?? 1;
        totalWeight += weight;
        const ref = {
            nodeId: el.nodeId ?? el.nodeIds?.[0] ?? null,
            ...(el.nodeIds ? { nodeIds: el.nodeIds, count: weight } : {}),
        };

        // 1축: 변수 미바인딩(raw 색).
        if (el.tokenStatus === 'raw' || el.token == null) {
            const isUnknown = el.tokenStatus === 'unknown';
            violations.push({
                ...ref,
                name: el.name,
                token: null,
                type: isUnknown ? 'unknown-token' : 'token-not-used',
                severity: 'high',
                detail: isUnknown
                    ? `바인딩됐으나 semantic 미도달(오타·깨진 별칭·remote 실패)${el.hex ? ` — hex ${el.hex}` : ''}`
                    : `raw 색 ${el.hex ?? '?'} 사용 (vapor 토큰 미바인딩)`,
                suggested: [],
            });
            hardViolatedWeight += weight;
            continue;
        }

        // 2축: 바인딩된 이름이 스키마에 없음(오타·미등록). 키 부재 = 무조건 위반(§5-10).
        if (tokenKeys && !tokenKeys.has(el.token)) {
            violations.push({
                ...ref,
                name: el.name,
                token: el.token,
                type: 'unknown-token',
                severity: 'high',
                detail: `스키마 미등록 토큰명 ${el.token} (오타·미등록 의심)`,
                suggested: [],
            });
            hardViolatedWeight += weight;
            continue;
        }

        const meta = semantic[el.token];

        // 2축: do-not-use.
        if (meta?.status === 'do-not-use') {
            violations.push({
                ...ref,
                name: el.name,
                token: el.token,
                type: 'do-not-use',
                severity: 'high',
                detail: `${el.token} 은(는) do-not-use 토큰`,
                suggested: [],
            });
            hardViolatedWeight += weight;
            continue;
        }

        // 2축: role 불일치 — property가 전제하는 role과 토큰 role이 어긋남.
        const expectedRole = ROLE_BY_PROPERTY[el.property];
        if (expectedRole && meta?.role && meta.role !== expectedRole) {
            violations.push({
                ...ref,
                name: el.name,
                token: el.token,
                type: 'role-mismatch',
                severity: 'high',
                detail: `${el.property} 자리에 role=${meta.role} 토큰 사용 (기대 role=${expectedRole})`,
                suggested: [],
            });
            hardViolatedWeight += weight;
            continue;
        }

        // 4축: foreground 등급(100/200)과 배경 3분류 대조.
        if (meta?.role === 'foreground' && meta.gradeRule && el.background) {
            const grade = el.token.split('.').pop();
            const bg = el.background.kind;
            if (grade === '100' && bg === 'other') {
                violations.push({
                    ...ref,
                    name: el.name,
                    token: el.token,
                    type: 'fg-grade-mismatch',
                    severity: 'high',
                    detail: `fg-100은 순백/투명 배경에만 — 현재 배경 ${el.background.hex ?? '?'}`,
                    suggested: [el.token.replace(/\.100$/, '.200')],
                });
                hardViolatedWeight += weight;
                continue;
            }
            if (bg === 'ambiguous') {
                violations.push({
                    ...ref,
                    name: el.name,
                    token: el.token,
                    type: 'fg-grade-ambiguous',
                    severity: 'info',
                    detail: `배경 식별 모호(${el.background.hex ?? '?'}) — 검토 필요`,
                    suggested: [],
                });
            }
        }

        conformant.push({ ...ref, name: el.name, token: el.token });
        conformWeight += weight;
    }

    const total = totalWeight;
    const conformCount = conformWeight;
    // 검산 가드 — high 위반을 가진 요소 가중치 합과 1:1로 맞아야 한다. 어긋나면 루프/정규화 버그.
    // 카운트는 요소 단위다(같은 nodeId에 fill/stroke/text가 각각 위반 가능 — nodeId dedup 금지).
    if (conformCount !== total - hardViolatedWeight) {
        throw new Error(
            `집계 불일치: conformant ${conformCount} != total(${total}) - high위반요소(${hardViolatedWeight})`,
        );
    }

    return {
        violations,
        conformant,
        summary: {
            total,
            conformCount,
            conformanceRate: total ? Number((conformCount / total).toFixed(3)) : null,
            highViolations: violations.filter((v) => v.severity === 'high').length,
            infoFlags: violations.filter((v) => v.severity === 'info').length,
        },
    };
}

// 3단 LLM용 의미 루브릭 서브셋 — 입력에 실제 등장한 토큰의 $description/when/avoid만 추린다.
// avoid의 "조건 → colors.X.Y"는 우변이 그대로 remedy다.
export function buildRubric(elements, semantic) {
    const rubric = {};
    for (const el of elements) {
        const t = el.token;
        if (!t || rubric[t] || !semantic[t]) continue;
        rubric[t] = {
            description: semantic[t].$description ?? null,
            when: semantic[t].when ?? [],
            avoid: semantic[t].avoid ?? [],
        };
    }
    return rubric;
}

async function readStdin() {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    return Buffer.concat(chunks).toString('utf8');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    const fileArg = process.argv[2];
    const input = fileArg ? await readFile(fileArg, 'utf8') : await readStdin();
    const parsed = JSON.parse(input);
    const elements = Array.isArray(parsed) ? parsed : (parsed.colors ?? []);
    const mode = parsed.schemaMode === 'dark' ? 'dark' : 'light';
    const ruleset = await loadColorSchema(mode);
    const result = evaluate(elements, ruleset);
    result.rubric = buildRubric(elements, ruleset.semantic);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
