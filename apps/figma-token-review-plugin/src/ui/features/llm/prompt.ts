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
    '2) nodeTree — 프레임 하위 노드의 구조(id, type, name, parentId, childIds, xywh). 대상 노드의 컴포넌트/이웃 관계 파악에 사용.',
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
    '의미 판정 가이드 (vapor 토큰 의미 기준):',
    '- color: 각 토큰의 when/avoid 가 전제하는 역할(danger/warning/primary/normal/hint 등)과 실제 자리(노드 이름·부모·인접 노드)의 의미가 부합하는가.',
    '  - avoid 의 "조건 → color-X-Y" 형식은 우변이 그대로 remedy 후보다.',
    '- typography: rank 는 위계 인덱스(작을수록 큰 제목). totalRanks 와 함께 보고 위계 뒤집힘 / 본문에 heading 오용 등을 잡는다.',
    '  - viewport 의존 규칙은 textStyle 의 when 에 명시("mobile viewports → heading1" 등)되어 있다.',
    '- 점수화(0-100) 금지. PASS/FAIL + confidence 만.',
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
    const content: Array<TextBlock | ImageBlock> = [
        { type: 'text', text: JSON.stringify(input) },
    ];
    if (screenshotB64) {
        content.push({
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: screenshotB64 },
        });
    }
    return {
        model,
        max_tokens: 4096,
        system: [
            { type: 'text', text: SYSTEM_BASE },
            { type: 'text', text: SEMANTIC_GUIDE, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content }],
    };
}
