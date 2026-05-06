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
            {
                mt_span: 'onClick',
                category: 'Terminology/Prop name mistranslated',
                severity: 'critical',
                source_span: 'onClick',
                explanation: '',
            },
        ]);
        expect(spans).toEqual(['hello', 'world']);
    });

    it('error span at start → one trailing span', () => {
        const spans = extractNoEditSpans('클릭 handler callback', [
            {
                mt_span: '클릭',
                category: 'Terminology/Prop name mistranslated',
                severity: 'critical',
                source_span: 'onClick',
                explanation: '',
            },
        ]);
        expect(spans).toEqual(['handler callback']);
    });

    it('error span at end → one leading span', () => {
        const spans = extractNoEditSpans('click the 버튼', [
            {
                mt_span: '버튼',
                category: 'Terminology/Component name inconsistency',
                severity: 'major',
                source_span: 'Button',
                explanation: '',
            },
        ]);
        expect(spans).toEqual(['click the']);
    });

    it('multiple errors → multiple no-edit spans', () => {
        const spans = extractNoEditSpans('A 클릭 B 버튼 C', [
            {
                mt_span: '클릭',
                category: 'Terminology/Prop name mistranslated',
                severity: 'critical',
                source_span: 'onClick',
                explanation: '',
            },
            {
                mt_span: '버튼',
                category: 'Terminology/Component name inconsistency',
                severity: 'major',
                source_span: 'Button',
                explanation: '',
            },
        ]);
        expect(spans).toEqual(['A', 'B', 'C']);
    });

    it('error span not present in mtOutput → whole string returned', () => {
        const spans = extractNoEditSpans('hello world', [
            {
                mt_span: 'notfound',
                category: 'Accuracy/Mistranslation',
                severity: 'major',
                source_span: 'x',
                explanation: '',
            },
        ]);
        expect(spans).toEqual(['hello world']);
    });

    it('empty mtOutput → returns empty array', () => {
        const spans = extractNoEditSpans('', [
            {
                mt_span: 'anything',
                category: 'Accuracy/Mistranslation',
                severity: 'major',
                source_span: 'x',
                explanation: '',
            },
        ]);
        expect(spans).toEqual([]);
    });

    it('duplicate mt_span — replaces only first occurrence', () => {
        // String.replace replaces the first match only
        const spans = extractNoEditSpans('foo bar foo', [
            {
                mt_span: 'foo',
                category: 'Accuracy/Mistranslation',
                severity: 'minor',
                source_span: 'foo',
                explanation: '',
            },
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
        // noEditSpans: ["handler"] (the part outside the error span "클릭")
        // rewrittenOutput preserves "handler" → no over-edit
        const result = applySelectivePatch('클릭 handler', 'onClick handler', ['handler']);
        expect(result.hasOverEdit).toBe(false);
        expect(result.result).toBe('onClick handler');
    });

    it('change outside allowed span → over-edit detected, restores damaged no-edit span', () => {
        // noEditSpans: ["handler"] — LLM changed it to "핸들러" → over-edit
        // B1: find "핸들러" at ~same offset in rewritten, replace with "handler"
        const result = applySelectivePatch('클릭 handler', 'onClick 핸들러', ['handler']);
        expect(result.hasOverEdit).toBe(true);
        expect(result.result).toBe('onClick handler');
    });

    it('empty noEditSpans with change → no over-edit (nothing to protect)', () => {
        // If noEditSpans is empty, entire string is in allowed edit zone
        const result = applySelectivePatch('hello world', 'hello 세계', []);
        expect(result.hasOverEdit).toBe(false);
        expect(result.result).toBe('hello 세계');
    });

    it('entire string is one no-edit span → over-edit if changed, falls back to MT', () => {
        // noEditSpans = ["handler callback"] — LLM changed it entirely
        const result = applySelectivePatch('handler callback', '핸들러 콜백', ['handler callback']);
        expect(result.hasOverEdit).toBe(true);
        // Restored: offset 0..15 in rewritten replaced with "handler callback"
        expect(result.result).toBe('handler callback');
    });

    it('multiple no-edit spans — restores each damaged one', () => {
        // MT: "A 클릭 B handler C"  noEditSpans: ["A", "B", "C"]
        // LLM changed "B" to "비" → over-edit on "B"
        const result = applySelectivePatch('A 클릭 B handler C', 'A onClick 비 handler C', [
            'A',
            'B',
            'C',
        ]);
        expect(result.hasOverEdit).toBe(true);
        expect(result.result).toContain('B');
        expect(result.result).not.toContain('비');
    });

    it('no-edit span completely absent from rewritten and MT → falls back to mtOutput', () => {
        // Span "ghost" doesn't appear in MT either → cannot restore, full fallback
        const result = applySelectivePatch('hello world', 'hi earth', ['ghost']);
        expect(result.hasOverEdit).toBe(true);
        expect(result.result).toBe('hello world');
    });
});
