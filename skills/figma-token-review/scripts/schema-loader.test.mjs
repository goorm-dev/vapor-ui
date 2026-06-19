import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
    flattenSemantic,
    flattenTextStyle,
    loadColorSchema,
    loadTypographySchema,
} from './schema-loader.mjs';

test('flattenSemantic: 중첩 트리를 점 표기 키로 평탄화한다', () => {
    const out = flattenSemantic({
        colors: {
            foreground: {
                $extensions: {
                    'io.goorm.vapor': {
                        gradeRules: { 100: 'RULE-100', 200: 'RULE-200' },
                    },
                },
                primary: {
                    100: {
                        $description: 'desc',
                        $extensions: {
                            'io.goorm.vapor': {
                                when: ['w'],
                                avoid: ['a → colors.foreground.primary.200'],
                                accessibility: { role: 'foreground', minimumContrast: '4.5:1' },
                            },
                        },
                        $value: '{colors.blue.600}',
                    },
                },
            },
        },
    });
    assert.ok(out['colors.foreground.primary.100']);
    const t = out['colors.foreground.primary.100'];
    assert.equal(t.role, 'foreground');
    assert.equal(t.minimumContrast, '4.5:1');
    assert.deepEqual(t.when, ['w']);
    assert.equal(t.valueRef, '{colors.blue.600}');
});

test('flattenSemantic: gradeRules는 그룹에서 leaf 등급별로 상속된다', () => {
    const out = flattenSemantic({
        colors: {
            foreground: {
                $extensions: {
                    'io.goorm.vapor': {
                        gradeRules: { 100: 'ONLY-WHITE', 200: 'NON-WHITE' },
                    },
                },
                primary: {
                    100: { $extensions: {}, $value: '{x}' },
                    200: { $extensions: {}, $value: '{y}' },
                    inverse: { $extensions: {}, $value: '{z}' },
                },
            },
        },
    });
    assert.equal(out['colors.foreground.primary.100'].gradeRule, 'ONLY-WHITE');
    assert.equal(out['colors.foreground.primary.200'].gradeRule, 'NON-WHITE');
    assert.equal(out['colors.foreground.primary.inverse'].gradeRule, null);
});

test('flattenTextStyle: 16단 위계를 배열 순서로 보존한다', () => {
    const { order, styles } = flattenTextStyle({
        textStyle: {
            $type: 'typography',
            display1: {
                $extensions: { 'io.goorm.vapor': { when: ['w1'], avoid: [] } },
                $value: {},
            },
            body4: {
                $extensions: { 'io.goorm.vapor': { when: [], avoid: ['av'] } },
                $value: {},
            },
        },
    });
    assert.deepEqual(order, ['display1', 'body4']);
    assert.deepEqual(styles.display1.when, ['w1']);
    assert.deepEqual(styles.body4.avoid, ['av']);
});

test('실제 스키마: do-not-use 토큰은 정확히 2개', async () => {
    const { semantic } = await loadColorSchema('light');
    const doNotUse = Object.entries(semantic)
        .filter(([, m]) => m.status === 'do-not-use')
        .map(([k]) => k)
        .sort();
    assert.deepEqual(doNotUse, ['colors.background.hint.200', 'colors.background.secondary.100']);
});

test('실제 스키마: accessibility.role 분포가 bg14/fg17/border8=39', async () => {
    const { semantic } = await loadColorSchema('light');
    const counts = { background: 0, foreground: 0, border: 0 };
    for (const m of Object.values(semantic)) {
        if (m.role && counts[m.role] !== undefined) counts[m.role]++;
    }
    assert.deepEqual(counts, { background: 14, foreground: 17, border: 8 });
});

test('실제 스키마: foreground.*.100/200에 gradeRule이 채워진다', async () => {
    const { semantic } = await loadColorSchema('light');
    assert.match(semantic['colors.foreground.primary.100'].gradeRule, /pure white/i);
    assert.match(semantic['colors.foreground.primary.200'].gradeRule, /not pure white/i);
});

test('실제 스키마: light/dark가 같은 토큰 키 집합을 가진다', async () => {
    const light = await loadColorSchema('light');
    const dark = await loadColorSchema('dark');
    assert.deepEqual(Object.keys(light.semantic).sort(), Object.keys(dark.semantic).sort());
});

test('실제 스키마: text-style 16단이 위계 순으로 로드된다', async () => {
    const { order } = await loadTypographySchema();
    assert.equal(order.length, 16);
    assert.equal(order[0], 'display1');
    assert.equal(order[order.length - 1], 'body4');
});
