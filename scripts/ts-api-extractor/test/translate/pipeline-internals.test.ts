import { describe, expect, it } from 'vitest';

import { applySelectivePatch, extractNoEditSpans } from '~/translate/pipeline';
import type { PatchResult } from '~/translate/pipeline';

describe('extractNoEditSpans', () => {
    it('no errors → returns trimmed whole string', () => {
        const spans = extractNoEditSpans('hello world', []);
        expect(spans).toEqual(['hello world']);
    });

    it('single error span in the middle → two surrounding spans', () => {
        const spans = extractNoEditSpans('hello onClick world', [
            { mt_span: 'onClick', category: 'Terminology/Prop name mistranslated', severity: 'critical', source_span: 'onClick', explanation: '' },
        ]);
        expect(spans).toEqual(['hello', 'world']);
    });

    it('error span at start → one trailing span', () => {
        const spans = extractNoEditSpans('클릭 handler callback', [
            { mt_span: '클릭', category: 'Terminology/Prop name mistranslated', severity: 'critical', source_span: 'onClick', explanation: '' },
        ]);
        expect(spans).toEqual(['handler callback']);
    });

    it('error span at end → one leading span', () => {
        const spans = extractNoEditSpans('click the 버튼', [
            { mt_span: '버튼', category: 'Terminology/Component name inconsistency', severity: 'major', source_span: 'Button', explanation: '' },
        ]);
        expect(spans).toEqual(['click the']);
    });

    it('multiple errors → multiple no-edit spans', () => {
        const spans = extractNoEditSpans('A 클릭 B 버튼 C', [
            { mt_span: '클릭', category: 'Terminology/Prop name mistranslated', severity: 'critical', source_span: 'onClick', explanation: '' },
            { mt_span: '버튼', category: 'Terminology/Component name inconsistency', severity: 'major', source_span: 'Button', explanation: '' },
        ]);
        expect(spans).toEqual(['A', 'B', 'C']);
    });

    it('error span not present in mtOutput → whole string returned', () => {
        const spans = extractNoEditSpans('hello world', [
            { mt_span: 'notfound', category: 'Accuracy/Mistranslation', severity: 'major', source_span: 'x', explanation: '' },
        ]);
        expect(spans).toEqual(['hello world']);
    });

    it('empty mtOutput → returns empty array', () => {
        const spans = extractNoEditSpans('', [
            { mt_span: 'anything', category: 'Accuracy/Mistranslation', severity: 'major', source_span: 'x', explanation: '' },
        ]);
        expect(spans).toEqual([]);
    });

    it('duplicate mt_span — replaces only first occurrence', () => {
        // String.replace replaces the first match only
        const spans = extractNoEditSpans('foo bar foo', [
            { mt_span: 'foo', category: 'Accuracy/Mistranslation', severity: 'minor', source_span: 'foo', explanation: '' },
        ]);
        // first "foo" replaced → "\x00 bar foo" → trimmed → ["bar foo"]
        expect(spans).toEqual(['bar foo']);
    });
});

describe('applySelectivePatch', () => {
    it('no change → returns rewritten, hasOverEdit false', () => {
        const result: PatchResult = applySelectivePatch('hello', 'hello', []);
        expect(result).toEqual({ result: 'hello', hasOverEdit: false });
    });

    it('change within allowed span → no over-edit', () => {
        // mtOutput: "클릭 handler" — allowed to edit "클릭"
        // rewrittenOutput: "onClick handler" — changed "클릭" to "onClick" (allowed), "handler" preserved
        const result = applySelectivePatch('클릭 handler', 'onClick handler', ['클릭']);
        expect(result.hasOverEdit).toBe(false);
        expect(result.result).toBe('onClick handler');
    });

    it('change outside allowed span → over-edit detected, falls back to mtOutput', () => {
        // mtOutput: "클릭 handler" — allowed to edit "클릭"
        // rewrittenOutput: "onClick 핸들러" — "handler" (no-edit span) was also changed → over-edit
        const result = applySelectivePatch('클릭 handler', 'onClick 핸들러', ['클릭']);
        expect(result.hasOverEdit).toBe(true);
        expect(result.result).toBe('클릭 handler'); // falls back to mtOutput
    });

    it('empty allowedEditSpans with change → over-edit detected', () => {
        const result = applySelectivePatch('hello world', 'hello 세계', []);
        expect(result.hasOverEdit).toBe(true);
        expect(result.result).toBe('hello world');
    });

    it('entire string is in allowed span → no over-edit', () => {
        // When the whole mtOutput is the allowed span, noEditSpans will be empty after extraction
        const result = applySelectivePatch('버튼', '버튼입니다', ['버튼']);
        // noEditSpans = [] (whole string is replaced by \x00, resulting in empty after filter)
        expect(result.hasOverEdit).toBe(false);
        expect(result.result).toBe('버튼입니다');
    });
});
