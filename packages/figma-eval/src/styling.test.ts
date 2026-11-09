import { describe, expect, it } from 'vitest';

import { checkStyling } from './styling';

const check = (files: Record<string, string[]>) =>
    checkStyling(Object.entries(files).map(([path, lines]) => ({ path, text: lines.join('\n') })));

const at = (hits: { at: string }[]) => hits.map((h) => h.at);

describe('checkStyling', () => {
    it('fails hex, rgb and hsl color literals', () => {
        const r = check({
            'a.css': [
                '.a {',
                '  color: #fff;',
                '  background: rgba(0, 0, 0, 0.5);',
                '  fill: hsl(0 0% 0%);',
                '}',
            ],
        });

        expect(r.result).toBe('fail');
        expect(r.hardcoded).toEqual([
            { at: 'a.css:2', text: 'color: #fff;' },
            { at: 'a.css:3', text: 'background: rgba(0, 0, 0, 0.5);' },
            { at: 'a.css:4', text: 'fill: hsl(0 0% 0%);' },
        ]);
    });

    it('fails a px value that is on the token scale', () => {
        const r = check({
            'App.tsx': ["export const A = () => <Box $css={{ padding: '16px' }} />;"],
        });

        expect(r.result).toBe('fail');
        expect(at(r.hardcoded)).toEqual(['App.tsx:1']);
    });

    it('fails absolute positioning', () => {
        const r = check({ 'a.css': ['.a {', '  position: absolute;', '}'] });

        expect(r.result).toBe('fail');
        expect(r.absolute).toEqual([{ at: 'a.css:2', text: 'position: absolute;' }]);
    });

    it('judges width and height against the dimension scale, which has no 72px', () => {
        const r = check({ 'a.css': ['.a { width: 72px; }', '.b { padding: 72px; }'] });

        expect(at(r.exempt.untokenized)).toEqual(['a.css:1']);
        expect(at(r.hardcoded)).toEqual(['a.css:2']);
    });

    it('exempts an absolute img with pixel sizes as an asset', () => {
        const r = check({
            'App.tsx': [
                'export const A = () => (',
                "    <img src=\"a.png\" style={{ position: 'absolute', width: '120px' }} />",
                ');',
            ],
        });

        expect(r.result).toBe('pass');
        expect(at(r.exempt.asset)).toEqual(['App.tsx:2']);
    });

    it('exempts a CSS rule whose class only an asset element uses', () => {
        const r = check({
            'App.tsx': ['export const A = () => <img className={styles.hero} src="a.png" />;'],
            'App.module.css': ['.hero {', '  position: absolute;', '  top: 16px;', '}'],
        });

        expect(r.result).toBe('pass');
        expect(at(r.exempt.asset)).toEqual(['App.module.css:2', 'App.module.css:3']);
    });

    it('exempts a .sr-only rule', () => {
        const r = check({
            'a.css': [
                '.sr-only {',
                '  position: absolute;',
                '  width: 1px;',
                '  height: 1px;',
                '  overflow: hidden;',
                '}',
            ],
        });

        expect(r.result).toBe('pass');
        expect(at(r.exempt.srOnly)).toEqual(['a.css:2', 'a.css:3', 'a.css:4']);
    });

    it('exempts a visually hidden box written inline', () => {
        const r = check({
            'App.tsx': [
                'export const A = () => (',
                "    <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Label</span>",
                ');',
            ],
        });

        expect(r.result).toBe('pass');
        expect(at(r.exempt.srOnly)).toEqual(['App.tsx:2']);
    });

    it('exempts a 1px border', () => {
        const r = check({ 'a.css': ['.a { border: 1px solid var(--x); }'] });

        expect(r.result).toBe('pass');
        expect(at(r.exempt.border1px)).toEqual(['a.css:1']);
    });

    it('exempts an aria-hidden icon laid over a TextInput', () => {
        const r = check({
            'App.tsx': [
                'export const A = () => (',
                "    <div style={{ position: 'relative' }}>",
                '        <TextInput />',
                "        <SearchIcon aria-hidden style={{ position: 'absolute', left: '12px' }} />",
                '    </div>',
                ');',
            ],
        });

        expect(r.result).toBe('pass');
        expect(at(r.exempt.inputIcon)).toEqual(['App.tsx:4']);
    });

    it('does not count a px inside a var() fallback', () => {
        const r = check({ 'a.css': ['.a { padding: var(--vapor-x, 16px); }'] });

        expect(r.result).toBe('pass');
        expect(r.hardcoded).toEqual([]);
        expect(r.exempt.untokenized).toEqual([]);
    });

    it('does not count a px inside a comment', () => {
        const r = check({
            'App.tsx': [
                '// padding: 16px',
                '/* margin: 16px',
                '   gap: 8px */',
                'export const A = 1; /* 24px */',
                "export const B = '16px';",
            ],
        });

        expect(at(r.hardcoded)).toEqual(['App.tsx:5']);
    });

    it('passes with a px off the token scale, reporting it as an exemption', () => {
        const r = check({ 'a.css': ['.a { margin: 13px; }'] });

        expect(r).toEqual({
            version: 1,
            result: 'pass',
            absolute: [],
            hardcoded: [],
            exempt: {
                asset: [],
                srOnly: [],
                border1px: [],
                untokenized: [{ at: 'a.css:1', text: '.a { margin: 13px; }' }],
                inputIcon: [],
            },
        });
    });

    it.todo('fails a named color such as `color: red`');
    it.todo('fails a unitless number that a token covers, such as `$css={{ padding: 16 }}`');
    it.todo('fails a rem value that a token covers, such as `1rem`');
    it.todo(
        'judges each px value on its own instead of failing the whole line for one on-scale value',
    );
    it.todo('counts a Box whose only child is `{list.map(...)}` of img as an asset');
});
