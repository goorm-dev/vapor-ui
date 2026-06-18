import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildRubric, evaluate } from './evaluate.mjs';

// 고정 룰셋 — 파일 IO 없이 결정론 분기만 검증한다.
const RULESET = {
    semantic: {
        'colors.background.primary.100': {
            role: 'background',
            status: null,
            gradeRule: null,
            when: ['선택 상태 배경'],
            avoid: ['페이지 배경 → colors.background.canvas.100'],
            $description: 'subtle primary bg',
        },
        'colors.background.hint.200': {
            role: 'background',
            status: 'do-not-use',
            gradeRule: null,
        },
        'colors.foreground.primary.100': {
            role: 'foreground',
            status: null,
            gradeRule: 'Use ONLY on pure white (#ffffff) or transparent backgrounds',
            when: ['흰 배경 위 브랜드 텍스트'],
            avoid: ['non-white 배경 → colors.foreground.primary.200'],
            $description: 'subtle primary fg',
        },
        'colors.foreground.primary.200': {
            role: 'foreground',
            status: null,
            gradeRule: 'Use on any surface that is not pure white',
        },
    },
    tokenKeys: [
        'colors.background.primary.100',
        'colors.background.hint.200',
        'colors.foreground.primary.100',
        'colors.foreground.primary.200',
    ],
};

test('정상 토큰은 적합', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'bg',
                property: 'fill',
                token: 'colors.background.primary.100',
                tokenStatus: 'ok',
                background: null,
            },
        ],
        RULESET,
    );
    assert.equal(r.summary.highViolations, 0);
    assert.equal(r.summary.conformanceRate, 1);
});

test('raw 미바인딩 = token-not-used(high)', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'x',
                property: 'fill',
                token: null,
                hex: '#abcdef',
                tokenStatus: 'raw',
                background: null,
            },
        ],
        RULESET,
    );
    assert.equal(r.violations[0].type, 'token-not-used');
    assert.equal(r.violations[0].severity, 'high');
});

test('unknown(미도달) = unknown-token(high)', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'x',
                property: 'fill',
                token: null,
                tokenStatus: 'unknown',
                background: null,
            },
        ],
        RULESET,
    );
    assert.equal(r.violations[0].type, 'unknown-token');
    assert.equal(r.violations[0].severity, 'high');
});

test('스키마 키 부재 = unknown-token(high)', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'x',
                property: 'fill',
                token: 'colors.backgroud.primary',
                tokenStatus: 'ok',
                background: null,
            },
        ],
        RULESET,
    );
    assert.equal(r.violations[0].type, 'unknown-token');
    assert.equal(r.violations[0].severity, 'high');
});

test('do-not-use = high', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'x',
                property: 'fill',
                token: 'colors.background.hint.200',
                tokenStatus: 'ok',
                background: null,
            },
        ],
        RULESET,
    );
    assert.equal(r.violations[0].type, 'do-not-use');
});

test('role 불일치 = high (fill 자리에 foreground 토큰)', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'x',
                property: 'fill',
                token: 'colors.foreground.primary.100',
                tokenStatus: 'ok',
                background: null,
            },
        ],
        RULESET,
    );
    assert.equal(r.violations[0].type, 'role-mismatch');
});

test('4축: fg-100을 other 배경에 = fg-grade-mismatch(high) + .200 제안', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'txt',
                property: 'text',
                token: 'colors.foreground.primary.100',
                tokenStatus: 'ok',
                background: { kind: 'other', hex: '#2a6ff3' },
            },
        ],
        RULESET,
    );
    assert.equal(r.violations[0].type, 'fg-grade-mismatch');
    assert.deepEqual(r.violations[0].suggested, ['colors.foreground.primary.200']);
});

test('4축: fg-100을 white 배경에 = 적합', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'txt',
                property: 'text',
                token: 'colors.foreground.primary.100',
                tokenStatus: 'ok',
                background: { kind: 'white', hex: '#ffffff' },
            },
        ],
        RULESET,
    );
    assert.equal(r.summary.highViolations, 0);
});

test('4축: 배경 모호 = fg-grade-ambiguous(info), 적합률 중립', () => {
    const r = evaluate(
        [
            {
                nodeId: '1',
                name: 'txt',
                property: 'text',
                token: 'colors.foreground.primary.100',
                tokenStatus: 'ok',
                background: { kind: 'ambiguous', hex: '#123456' },
            },
        ],
        RULESET,
    );
    assert.equal(r.violations[0].type, 'fg-grade-ambiguous');
    assert.equal(r.violations[0].severity, 'info');
    assert.equal(r.summary.conformanceRate, 1);
});

test('그룹 count 가중 집계', () => {
    const r = evaluate(
        [
            {
                nodeIds: ['1', '2', '3'],
                count: 3,
                name: 'ok',
                property: 'fill',
                token: 'colors.background.primary.100',
                tokenStatus: 'ok',
                background: null,
            },
            {
                nodeIds: ['4'],
                count: 1,
                name: 'bad',
                property: 'fill',
                token: null,
                tokenStatus: 'raw',
                background: null,
            },
        ],
        RULESET,
    );
    assert.equal(r.summary.total, 4);
    assert.equal(r.summary.conformCount, 3);
    assert.equal(r.summary.conformanceRate, 0.75);
});

test('검산 가드: 같은 nodeId 다중 위반도 요소 단위로 집계', () => {
    // 같은 nodeId가 fill·stroke 두 요소로 각각 raw — 요소 단위 카운트라 throw 없이 2건.
    const r = evaluate(
        [
            {
                nodeId: '9',
                name: 'x',
                property: 'fill',
                token: null,
                tokenStatus: 'raw',
                background: null,
            },
            {
                nodeId: '9',
                name: 'x',
                property: 'stroke',
                token: null,
                tokenStatus: 'raw',
                background: null,
            },
        ],
        RULESET,
    );
    assert.equal(r.summary.total, 2);
    assert.equal(r.summary.highViolations, 2);
    assert.equal(r.summary.conformCount, 0);
});

test('buildRubric: 입력 토큰의 description/when/avoid만 추린다', () => {
    const rubric = buildRubric(
        [{ token: 'colors.background.primary.100' }, { token: null }],
        RULESET.semantic,
    );
    assert.ok(rubric['colors.background.primary.100']);
    assert.match(
        rubric['colors.background.primary.100'].avoid[0],
        /→ colors\.background\.canvas\.100/,
    );
});
