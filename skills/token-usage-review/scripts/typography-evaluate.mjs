// typography-evaluate.mjs
// 2단: typography 토큰 적용 여부 — 결정론. 위계(축 C)는 3단 LLM이 본다.
// 판정 단위는 추출(getStyledTextSegments)이 노드별로 정한 appliedStatus다.
// 스키마를 안 읽으므로 schema-loader import도 없다(색상 evaluate와 다른 점).
//
//   TypoElement {
//     nodeId:     string                 // Figma 노드 id (리포트 딥링크)
//     nodeIds:    string[] | undefined   // 그룹핑된 요소(extract.figma.js)의 노드 id 목록
//     count:      number | undefined     // 그룹이 대표하는 노드 수(가중치). 미지정 시 1
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
//   node scripts/typography-evaluate.mjs extract.json  # 파일 인자(권장 — 추출 결과 객체 그대로)
//   node scripts/typography-evaluate.mjs < elements.json
//   또는 import { evaluateTypography } from './typography-evaluate.mjs' 로 테스트에서 직접 호출.
// CLI 출력에는 입력에 실제 등장한 Text Style의 위계 루브릭 서브셋(rubric)과
// 스키마에 없는 스타일 목록(unknownTextStyles)이 포함된다 — 3단 LLM은 이것만 보면 된다.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { loadTypographySchema } from "./schema-loader.mjs";

// raw만 high(토큰 전혀 미사용). 나머지(override/var-only/mixed/styled-clean)는 정상 취급.
// override·var-only·mixed는 디자이너가 직접 수정한 케이스이므로 위반으로 세지 않는다.
const HIGH_STATUSES = new Set(["raw"]);

const DETAIL_BY_STATUS = {
  raw: (el) =>
    `raw 값 직접 입력 (Text Style·변수 미바인딩): ${el.resolved?.fontName?.family ?? "?"} ${el.resolved?.fontSize ?? "?"}px`,
};

export function evaluateTypography(elements) {
  const violations = [];
  const conformant = [];
  // 가중 집계 — 그룹 요소(count>1)는 그 수만큼 센다.
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
    if (HIGH_STATUSES.has(el.appliedStatus)) {
      violations.push({
        ...ref,
        name: el.name,
        characters: el.characters,
        textStyle: el.textStyle,
        type: `typo-${el.appliedStatus}`,
        severity: "high",
        detail: DETAIL_BY_STATUS[el.appliedStatus](el),
        suggested: [],
      });
      violatedWeight += weight;
    } else {
      // styled-clean / styled-override / var-only / mixed 모두 정상 취급
      conformant.push({
        ...ref,
        name: el.name,
        textStyle: el.textStyle,
      });
      conformWeight += weight;
    }
  }

  const total = totalWeight;
  const conformCount = conformWeight;
  // 집계 검산 가드 — violations는 high뿐이므로 가중치 합이 1:1로 맞아야 한다.
  if (conformCount !== total - violatedWeight) {
    throw new Error(
      `집계 불일치: conformant ${conformCount} != total(${total}) - violations(${violatedWeight})`,
    );
  }
  return {
    violations,
    conformant,
    summary: {
      total,
      conformCount,
      conformanceRate: total ? Number((conformCount / total).toFixed(3)) : null,
      highViolations: violatedWeight,
      infoFlags: 0,
    },
  };
}

// 3단 LLM이 쓸 위계 루브릭 서브셋 — 입력에 실제 등장한 Text Style의 정의만 추린다.
// 스키마에 없는 스타일(오타/커스텀)은 unknownTextStyles로 따로 알린다(LOW confidence 처리용).
export function buildTypographyRubric(elements, schema) {
  const rubric = {};
  const unknown = new Set();
  for (const el of elements) {
    const s = el.textStyle;
    if (!s || rubric[s]) continue;
    const def = schema[s];
    if (!def) {
      unknown.add(s);
      continue;
    }
    const m = def.$extensions?.vapor ?? {};
    rubric[s] = {
      intent: m.intent ?? null,
      when: m.when ?? [],
      avoid: m.avoid ?? [],
      viewport: m.viewport ?? null,
    };
  }
  return { rubric, unknownTextStyles: [...unknown] };
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  // 입력: 파일 인자(권장) 또는 stdin. extract.figma.js 반환 객체({typography:[...]})와
  // 순수 TypoElement 배열 둘 다 받는다 — 추출 결과 파일 하나를 두 evaluate가 공유한다.
  const fileArg = process.argv[2];
  const [schema, input] = await Promise.all([
    loadTypographySchema(),
    fileArg ? readFile(fileArg, "utf8") : readStdin(),
  ]);
  const parsed = JSON.parse(input);
  const elements = Array.isArray(parsed) ? parsed : (parsed.typography ?? []);
  const result = evaluateTypography(elements);
  const { rubric, unknownTextStyles } = buildTypographyRubric(elements, schema);
  result.rubric = rubric;
  result.unknownTextStyles = unknownTextStyles;
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}
