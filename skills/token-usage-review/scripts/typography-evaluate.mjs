// typography-evaluate.mjs
// 2단: typography 토큰 적용 여부 — 결정론. 위계(축 C)는 3단 LLM이 본다.
// 판정 단위는 추출(getStyledTextSegments)이 노드별로 정한 appliedStatus다.
// 스키마를 안 읽으므로 schema-loader import도 없다(색상 evaluate와 다른 점).
//
//   TypoElement {
//     nodeId:     string                 // Figma 노드 id (리포트 딥링크)
//     name:       string                 // 레이어 이름
//     characters: string                 // 텍스트 내용(앞 20자) — 어느 텍스트인지 식별용
//     textStyle:  string | null          // 적용된 Text Style 이름(heading3) / 미적용 null
//     viewport:   'pc'|'tablet'|'mobile' // 프레임 너비로 판별 (3단 뷰포트 의존 규칙용)
//     appliedStatus:                     // 추출이 판정한 노드의 토큰 적용 상태 (핵심)
//       'styled-clean'    // Text Style 적용 + 스타일과 resolved 값 완전 일치 (정상)
//       | 'styled-override' // Text Style 적용했으나 일부 필드를 직접 수정 — 정상 취급
//       | 'var-only'      // Text Style 없이 개별 변수만 바인딩 — 정상 취급
//       | 'raw'           // textStyleId 없고 변수 바인딩도 없음 (high — 토큰 미사용)
//       | 'mixed'         // 한 노드에 세그먼트 2개+ — 정상 취급
//     overriddenFields: string[]         // styled-override일 때 어긋난 필드(예: ['fontWeight'])
//     resolved: {                        // 리포트·검산용 실제 resolved 값
//       fontSize, lineHeight, letterSpacing, fontName, fontWeight
//     }
//   }
//
// 출력: { violations:[...], conformant:[...], summary:{...} }
//
// 사용:
//   node scripts/typography-evaluate.mjs < elements.json
//   또는 import { evaluateTypography } from './typography-evaluate.mjs' 로 테스트에서 직접 호출.
import { fileURLToPath } from 'node:url';

// raw만 high(토큰 전혀 미사용). 나머지(override/var-only/mixed/styled-clean)는 정상 취급.
// override·var-only·mixed는 디자이너가 직접 수정한 케이스이므로 위반으로 세지 않는다.
const HIGH_STATUSES = new Set(['raw']);

const DETAIL_BY_STATUS = {
    raw: (el) =>
        `raw 값 직접 입력 (Text Style·변수 미바인딩): ${el.resolved?.fontName?.family ?? '?'} ${el.resolved?.fontSize ?? '?'}px`,
};

export function evaluateTypography(elements) {
    const violations = [];
    const conformant = [];

    for (const el of elements) {
        if (HIGH_STATUSES.has(el.appliedStatus)) {
            violations.push({
                nodeId: el.nodeId,
                name: el.name,
                characters: el.characters,
                textStyle: el.textStyle,
                type: `typo-${el.appliedStatus}`,
                severity: 'high',
                detail: DETAIL_BY_STATUS[el.appliedStatus](el),
                suggested: [],
            });
        } else {
            // styled-clean / styled-override / var-only / mixed 모두 정상 취급
            conformant.push({
                nodeId: el.nodeId,
                name: el.name,
                textStyle: el.textStyle,
            });
        }
    }

    const total = elements.length;
    const conformCount = conformant.length;
    // 집계 검산 가드 — violations는 high뿐이고 노드당 1 Element이므로 violations.length == hardViolated.size(1:1).
    if (conformCount !== total - violations.length) {
        throw new Error(
            `집계 불일치: conformant ${conformCount} != total(${total}) - violations(${violations.length})`,
        );
    }
    return {
        violations,
        conformant,
        summary: {
            total,
            conformCount,
            conformanceRate: total ? Number((conformCount / total).toFixed(3)) : null,
            highViolations: violations.length,
            infoFlags: 0,
        },
    };
}

async function readStdin() {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    return Buffer.concat(chunks).toString('utf8');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    const input = await readStdin();
    const elements = JSON.parse(input);
    const result = evaluateTypography(elements);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
