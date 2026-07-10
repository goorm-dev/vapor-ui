import type { LlmInput } from '~/ui/lib/rubric';

const SYSTEM_BASE = [
    '당신은 vapor 디자인 토큰의 의미 판정자다.',
    '결정론 분석은 일체 하지 않는다 — plugin이 이미 끝냈다.',
    '너의 역할은 두 가지뿐이다.',
    '1) 텍스트 위계(text styles) 적합성 분석',
    '2) semantic color의 역할/상태/상황 적합성 분석',
    '각 항목에 verdict(PASS/FAIL), confidence(HIGH/MED/LOW), 한국어 reasoning, 그리고 FAIL일 때만 자기 영역의 대체 토큰 후보(`suggested`)를 낸다.',
    '결정론 fail 노드는 입력에 없다. 결정론 fail에 대한 의견은 내지 마라.',
    '',
    '판정 입력은 세 가지다:',
    '1) rubric — 각 토큰의 의도(when/avoid, typography는 rank/totalRanks 포함). 사용된 토큰의 의도와 자리의 부합 여부를 판정.',
    '2) nodeTree — 프레임 하위 노드의 구조(id, type, name, parentId, childIds, xywh). TEXT 노드는 characters, textStyle 필드도 포함해 이웃 텍스트 간 rank 비교에 사용.',
    '3) 첨부 이미지 — 렌더된 프레임. 구조로 안 잡히는 시각적 위계(가장 큰 헤딩인가, 경고 색 자리인가)를 판정에 반영.',
    '출력은 다음 JSON 객체 하나뿐. 마크다운 fence/문장/접두사 금지.',
    '{',
    '  "typography": LlmTypoJudgment[],',
    '  "semanticColor": LlmColorJudgment[]',
    '}',
    '',
    'LlmTypoJudgment = {',
    '  "nodeId": string, "name": string, "token": string,',
    '  "verdict": "PASS" | "FAIL",',
    '  "confidence": "HIGH" | "MED" | "LOW",',
    '  "axis": "hierarchy" | "role" | "viewport",',
    '  "matchedRule": string,   // 위반(FAIL) 시 걸린 when/avoid 원문. PASS 면 부합한 when. 스키마에 없는 규칙 발명 금지. 없으면 빈 문자열.',
    '  "reasoning": string (Korean),',
    '  "suggested": string[]   // verdict=FAIL 일 때만 채움. 빈 배열 가능. 절대 string 으로 내지 마라.',
    '}',
    '',
    'LlmColorJudgment = {',
    '  "nodeId": string, "name": string, "property": "fill" | "fill-on-text" | "stroke", "token": string,',
    '  "verdict": "PASS" | "FAIL",',
    '  "confidence": "HIGH" | "MED" | "LOW",',
    '  "reasoning": string (Korean),',
    '  "suggested": string[]',
    '}',
    '',
    'Hard rules:',
    '- suggested 는 항상 배열. 후보 없으면 [].',
    '- 토큰 키(예: color-background-danger-100, subtitle1)는 영문 그대로.',
    '- reasoning 은 한국어. 어느 when/avoid 항목이 부합/위배되는지 명시.',
    '- 확신이 약하면 confidence를 낮추되 verdict는 PASS/FAIL 둘 중 하나만 사용.',
].join('\n');

const SEMANTIC_GUIDE = [
    '의미 판정 가이드:',
    '',
    '색상 판정 축: semantic color 의 when/avoid 가 전제하는 역할(danger/warning/primary/normal/hint 등) 과 실제 자리(노드 이름·부모·인접 노드)의 의미가 부합하는가.',
    '- avoid 의 "조건 → color-X-Y" 형식은 우변이 그대로 remedy 후보다.',
    '',
    'typography 판정 축 (각 대상에 정확히 하나 라벨):',
    '- hierarchy: 시각 위계 뒤집힘 / 본문에 heading 오용 / heading 에 body 오용. 근거는 rank(작을수록 큰 제목) 와 nodeTree 상 이웃 TEXT 노드의 rank·characters 비교 + 스크린샷의 시각 크기.',
    '- role: when/avoid 의 역할·문맥 규칙 위배 (예: subtitle 자리에 body, code 자리에 body).',
    '- viewport: when/avoid 의 뷰포트 규칙 위배. context.viewport ∈ {pc, tablet, mobile}. mobile 에서 display* 는 즉시 viewport FAIL.',
    '',
    '입력 3종 활용:',
    '1. rubric.textStyle — 전체 스타일의 rank/when/avoid/description. 대체 후보(suggested) 는 이 안에서만 선택.',
    '2. nodeTree — 각 TEXT 노드에 characters, textStyle 포함. 형제·부모 그룹에서 이웃 rank 비교로 위계 판정.',
    '3. 첨부 이미지 — 시각 크기·강조·위치. 구조로 안 잡히는 위계는 이미지에서.',
    '',
    '각 typography 판정에 필수:',
    '- axis: "hierarchy" | "role" | "viewport"',
    '- matchedRule: 위반한 when/avoid 문장 원문. PASS 면 부합한 when 문장. 스키마에 없는 규칙 발명 금지. 없으면 빈 문자열.',
    '- suggested: FAIL 일 때만 채움. rubric.textStyle 키만 허용.',
    '',
    '점수화(0-100) 금지. PASS/FAIL + confidence 만.',
].join('\n');

export type SystemBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } };

export type TextBlock = { type: 'text'; text: string };

export type ImageBlock = {
    type: 'image';
    source: { type: 'base64'; media_type: 'image/png'; data: string };
};

export type AnthropicMessagesRequest = {
    model: string;
    max_tokens: number;
    system: SystemBlock[];
    messages: Array<{ role: 'user'; content: Array<TextBlock | ImageBlock> }>;
};

export function buildRequest(
    input: LlmInput,
    screenshotB64: string,
    model: string,
): AnthropicMessagesRequest {
    const content: Array<TextBlock | ImageBlock> = [{ type: 'text', text: JSON.stringify(input) }];
    if (screenshotB64) {
        content.push({
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: screenshotB64 },
        });
    }

    return {
        model,
        max_tokens: 10000,
        system: [
            { type: 'text', text: SYSTEM_BASE },
            { type: 'text', text: SEMANTIC_GUIDE, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content }],
    };
}
