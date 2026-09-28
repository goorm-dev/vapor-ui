// typography-evaluate.mjs
// 2단: typography 토큰 적용 여부 — 결정론. 위계 적합(3축 의미)은 3단 LLM이 본다.
// 판정 단위는 추출(getStyledTextSegments)이 노드별로 정한 appliedStatus다.
//
//   TypoElement {
//     nodeId, nodeIds?, count?
//     name, characters
//     textStyle: string | null        // 적용된 Text Style 이름(heading3) / 미적용 null
//     viewport: 'pc'|'tablet'|'mobile' // 3단 LLM의 viewport 의존 규칙 판정용(여기선 안 씀)
//     appliedStatus:
//       'styled-clean'      // Text Style 적용 + 값 완전 일치 (정상)
//       | 'styled-override' // Text Style 적용 후 일부 필드 수동 수정 — info, 위반 아님(§5-8)
//       | 'var-only'        // Text Style 없이 개별 변수만 바인딩 — 정상 취급
//       | 'raw'             // textStyleId 없고 변수 바인딩도 없음 (high — 토큰 미사용)
//       | 'mixed'           // 한 노드에 세그먼트 2개+ — 정상 취급
//     overriddenFields: string[]
//     resolved: { fontSize, lineHeight, letterSpacing, fontName }
//   }
//
// 출력: { violations, conformant, summary, rubric, unknownTextStyles }
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { loadTypographySchema } from './schema-loader.mjs';

// raw만 high. styled-override는 info(font-weight 변수 바인딩 시 Figma가 detach를 강제하는
// 제약 + 의도적 오버라이드 가능성 때문에 high로 보면 오탐 — §5-8). 나머지는 정상.
const HIGH_STATUSES = new Set(['raw']);
const INFO_STATUSES = new Set(['styled-override']);
// 추출이 내보낼 수 있는 appliedStatus 전체. 이 집합 밖 값은 contract drift(오타·미정의)이므로
// 조용히 conformant로 넘기지 않고 high 위반으로 표면화한다.
const KNOWN_STATUSES = new Set(['styled-clean', 'styled-override', 'var-only', 'raw', 'mixed']);

export function evaluateTypography(elements) {
    const violations = [];
    const conformant = [];
    let totalWeight = 0;
    let conformWeight = 0;
    let violatedWeight = 0;

    for (const el of elements) {
        const weight = el.count ?? 1;
        totalWeight += weight;
        const ref = {
            nodeId: el.nodeId ?? el.nodeIds?.[0] ?? null,
            ...(el.nodeIds ? { nodeIds: el.nodeIds, count: weight } : {}),
        };

        if (!KNOWN_STATUSES.has(el.appliedStatus)) {
            violations.push({
                ...ref,
                name: el.name,
                characters: el.characters,
                textStyle: el.textStyle,
                type: 'typo-unknown-status',
                severity: 'high',
                detail: `알 수 없는 appliedStatus: ${el.appliedStatus ?? 'null'}`,
                suggested: [],
            });
            violatedWeight += weight;
            continue;
        }

        if (HIGH_STATUSES.has(el.appliedStatus)) {
            violations.push({
                ...ref,
                name: el.name,
                characters: el.characters,
                textStyle: el.textStyle,
                type: 'typo-raw',
                severity: 'high',
                detail: `raw 값 직접 입력 (Text Style·변수 미바인딩): ${el.resolved?.fontName?.family ?? '?'} ${el.resolved?.fontSize ?? '?'}px`,
                suggested: [],
            });
            violatedWeight += weight;
            continue;
        }

        if (INFO_STATUSES.has(el.appliedStatus)) {
            violations.push({
                ...ref,
                name: el.name,
                characters: el.characters,
                textStyle: el.textStyle,
                type: 'typo-styled-override',
                severity: 'info',
                detail: `Text Style 적용 후 수동 오버라이드: ${el.overriddenFields?.join(', ') ?? '?'}`,
                suggested: [],
            });
        }

        conformant.push({ ...ref, name: el.name, textStyle: el.textStyle });
        conformWeight += weight;
    }

    const total = totalWeight;
    const conformCount = conformWeight;
    if (conformCount !== total - violatedWeight) {
        throw new Error(
            `집계 불일치: conformant ${conformCount} != total(${total}) - high위반요소(${violatedWeight})`,
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

// 3단 LLM용 위계 루브릭 — 입력에 실제 쓰인 Text Style의 when/avoid + 위계 순위(16단 중 몇 번째).
// schema.order(display1 → ... → body4)가 위계라, 그 인덱스를 함께 주면 "위계 뒤집힘"을 LLM이 본다.
export function buildTypographyRubric(elements, schema) {
    const rubric = {};
    const unknownTextStyles = [];
    for (const el of elements) {
        const name = el.textStyle;
        if (!name || rubric[name]) continue;
        if (!schema.styles[name]) {
            if (!unknownTextStyles.includes(name)) unknownTextStyles.push(name);
            continue;
        }
        rubric[name] = {
            rank: schema.order.indexOf(name),
            totalRanks: schema.order.length,
            when: schema.styles[name].when ?? [],
            avoid: schema.styles[name].avoid ?? [],
            description: schema.styles[name].$description ?? null,
        };
    }
    return { rubric, unknownTextStyles };
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
    const elements = Array.isArray(parsed) ? parsed : (parsed.typography ?? []);
    const schema = await loadTypographySchema();
    const result = evaluateTypography(elements);
    const { rubric, unknownTextStyles } = buildTypographyRubric(elements, schema);
    result.rubric = rubric;
    result.unknownTextStyles = unknownTextStyles;
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
