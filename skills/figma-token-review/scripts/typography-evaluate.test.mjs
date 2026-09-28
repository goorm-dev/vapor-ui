import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildTypographyRubric, evaluateTypography } from './typography-evaluate.mjs';

test('styled-clean = 적합', () => {
    const r = evaluateTypography([
        {
            nodeId: '1',
            name: 'title',
            characters: 'Hi',
            textStyle: 'subtitle1',
            appliedStatus: 'styled-clean',
            overriddenFields: [],
            resolved: {},
        },
    ]);
    assert.equal(r.summary.highViolations, 0);
    assert.equal(r.summary.conformanceRate, 1);
});

test('raw = high', () => {
    const r = evaluateTypography([
        {
            nodeId: '1',
            name: 'x',
            characters: 'Hi',
            textStyle: null,
            appliedStatus: 'raw',
            overriddenFields: [],
            resolved: { fontName: { family: 'Inter' }, fontSize: 14 },
        },
    ]);
    assert.equal(r.violations[0].type, 'typo-raw');
    assert.equal(r.violations[0].severity, 'high');
    assert.equal(r.summary.conformanceRate, 0);
});

test('styled-override = info(위반 아님), 적합률 중립', () => {
    const r = evaluateTypography([
        {
            nodeId: '1',
            name: 'x',
            characters: 'Hi',
            textStyle: 'body1',
            appliedStatus: 'styled-override',
            overriddenFields: ['fontName'],
            resolved: {},
        },
    ]);
    assert.equal(r.violations[0].type, 'typo-styled-override');
    assert.equal(r.violations[0].severity, 'info');
    assert.equal(r.summary.highViolations, 0);
    assert.equal(r.summary.conformanceRate, 1);
});

test('var-only / mixed = 정상 취급', () => {
    const r = evaluateTypography([
        {
            nodeId: '1',
            name: 'a',
            characters: 'x',
            textStyle: null,
            appliedStatus: 'var-only',
            overriddenFields: [],
            resolved: {},
        },
        {
            nodeId: '2',
            name: 'b',
            characters: 'y',
            textStyle: null,
            appliedStatus: 'mixed',
            overriddenFields: [],
            resolved: {},
        },
    ]);
    assert.equal(r.summary.highViolations, 0);
    assert.equal(r.summary.conformanceRate, 1);
});

test('알 수 없는 appliedStatus = high (조용한 PASS 금지)', () => {
    const r = evaluateTypography([
        {
            nodeId: '1',
            name: 'x',
            characters: 'Hi',
            textStyle: null,
            appliedStatus: 'styled-cleam', // 오타 → contract drift
            overriddenFields: [],
            resolved: {},
        },
    ]);
    assert.equal(r.violations[0].type, 'typo-unknown-status');
    assert.equal(r.violations[0].severity, 'high');
    assert.equal(r.summary.conformanceRate, 0);
});

test('그룹 count 가중 + 검산 가드', () => {
    const r = evaluateTypography([
        {
            nodeIds: ['1', '2', '3'],
            count: 3,
            name: 'ok',
            textStyle: 'body2',
            appliedStatus: 'styled-clean',
            overriddenFields: [],
            resolved: {},
        },
        {
            nodeIds: ['4'],
            count: 1,
            name: 'bad',
            textStyle: null,
            appliedStatus: 'raw',
            overriddenFields: [],
            resolved: {},
        },
    ]);
    assert.equal(r.summary.total, 4);
    assert.equal(r.summary.conformCount, 3);
    assert.equal(r.summary.conformanceRate, 0.75);
});

test('buildTypographyRubric: 위계 순위 + when/avoid 추림', () => {
    const schema = {
        order: ['display1', 'heading1', 'subtitle1', 'body1'],
        styles: {
            subtitle1: {
                when: ['라벨'],
                avoid: ['본문 → body1'],
                $description: 'subtitle',
            },
        },
    };
    const { rubric, unknownTextStyles } = buildTypographyRubric(
        [{ textStyle: 'subtitle1' }, { textStyle: 'ghost-style' }],
        schema,
    );
    assert.equal(rubric.subtitle1.rank, 2);
    assert.equal(rubric.subtitle1.totalRanks, 4);
    assert.deepEqual(unknownTextStyles, ['ghost-style']);
});
