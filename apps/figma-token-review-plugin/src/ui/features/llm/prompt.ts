import type { LlmInput } from '~/ui/lib/rubric';

const SYSTEM_BASE = [
    '당신은 vapor 디자인 토큰의 의미 판정자다.',
    '결정론 분석은 일체 하지 않는다 — plugin이 이미 끝냈다.',
    '너의 역할은 두 가지뿐이다.',
    '1) 텍스트 위계(text styles) 적합성 분석',
    '2) semantic color의 역할/상태/상황 적합성 분석',
    '',
    'PASS 판정은 응답에서 제외한다. FAIL 항목만 emit 한다 (부재 = PASS).',
    '결정론 fail 노드는 입력에 없다. 결정론 fail에 대한 의견은 내지 마라.',
    '',
    '자기 취소 금지: reasoning 안에서 "PASS 로 재판단", "emit 불필요", "적절하므로 제외" 같은 문구로',
    '스스로 판정을 뒤집는 항목을 emit 하지 마라. PASS 라고 판단했다면 응답 배열에서 항목 자체를 빼라.',
    '자기 취소 문구가 포함된 항목은 서버가 안전망으로 드롭한다 — 즉 그런 항목은 아무 정보도 전달하지 못한다.',
    '',
    '판정 입력은 세 가지다:',
    '1) rubric — 각 토큰의 의도(when/avoid, typography는 rank 포함). 사용된 토큰의 의도와 자리의 부합 여부를 판정.',
    '2) nodeTree — 프레임 하위 노드의 구조(id, type, name, parentId). TEXT 노드는 characters, textStyle 필드도 포함해 이웃 텍스트 간 rank 비교에 사용.',
    '3) 첨부 이미지 — 렌더된 프레임. 구조로 안 잡히는 시각적 위계(가장 큰 헤딩인가, 경고 색 자리인가)를 판정에 반영.',
    '출력은 다음 JSON 객체 하나뿐. 마크다운 fence/문장/접두사 금지.',
    '{',
    '  "typography": LlmTypoJudgment[],',
    '  "semanticColor": LlmColorJudgment[]',
    '}',
    '',
    'LlmTypoJudgment = {',
    '  "nodeId": string,',
    '  "confidence": "HIGH" | "MED" | "LOW",',
    '  "axis": "hierarchy" | "role",',
    '  "matchedRule": string,   // 위반한 when/avoid 원문. 스키마에 없는 규칙 발명 금지. 없으면 빈 문자열.',
    '  "reasoning": string (Korean),',
    '  "suggested": string[]   // rubric.textStyle 키만. 빈 배열 가능. 절대 string 으로 내지 마라.',
    '}',
    '',
    'LlmColorJudgment = {',
    '  "nodeId": string,',
    '  "property": "fill" | "fill-on-text" | "stroke",',
    '  "confidence": "HIGH" | "MED" | "LOW",',
    '  "reasoning": string (Korean),',
    '  "suggested": string[]',
    '}',
    '',
    'Hard rules:',
    '- verdict 필드는 emit 하지 마라. FAIL 만 emit 하므로 verdict 는 항상 FAIL 로 취급된다.',
    '- name/token 은 응답에 넣지 마라. 서버가 nodeId(+property) 로 재구성한다.',
    '- suggested 는 항상 배열. 후보 없으면 [].',
    '- 토큰 키(예: color-background-danger-100, subtitle1)는 영문 그대로.',
    '- reasoning 은 한국어. 어느 when/avoid 항목이 위배되는지 명시.',
    '- 확신이 약하면 confidence 를 낮춰라. 완전 무증거면 항목 자체를 emit 하지 마라.',
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
    '(viewport 축은 결정론이 이미 판정. LLM 은 다루지 않는다.)',
    '',
    '입력 3종 활용:',
    '1. rubric.textStyle — 전체 스타일의 rank/when/avoid. 대체 후보(suggested) 는 이 안에서만 선택.',
    '2. nodeTree — 각 TEXT 노드에 characters, textStyle 포함. 형제·부모 그룹에서 이웃 rank 비교로 위계 판정.',
    '3. 첨부 이미지 — 시각 크기·강조·위치. 구조로 안 잡히는 위계는 이미지에서.',
    '',
    '각 typography 판정에 필수:',
    '- axis: "hierarchy" | "role"',
    '- matchedRule: 위반한 when/avoid 문장 원문. 스키마에 없는 규칙 발명 금지. 없으면 빈 문자열.',
    '- suggested: rubric.textStyle 키만 허용.',
    '',
    '점수화(0-100) 금지. confidence 만.',
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
        max_tokens: 30000,
        system: [
            { type: 'text', text: SYSTEM_BASE },
            { type: 'text', text: SEMANTIC_GUIDE, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content }],
    };
}
