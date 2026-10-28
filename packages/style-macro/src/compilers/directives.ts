/**
 * Directive prologue utilities.
 *
 * ES spec: a directive prologue is the leading sequence of ExpressionStatements
 * whose expression is a bare string literal. Common forms: `'use strict'`,
 * `'use client'` (Next.js / React Server Components), `'use server'`.
 *
 * Any import or other statement MUST follow these directives. Injecting an
 * `import` at offset 0 (before an existing `'use client'`) breaks the module —
 * Next's SWC parser rejects it with "The 'use client' directive must be placed
 * before other expressions."
 */

// Match ONE leading directive: optional whitespace, a quoted string, optional
// semicolon, trailing newline (or EOF).
const LEADING_DIRECTIVE_RE = /^\s*(['"])(?:(?!\1)[^\\\r\n]|\\.)*\1\s*;?\s*(?:\r?\n|$)/;

// Comments and whitespace that may appear BEFORE a directive. ES spec allows
// comments to precede a directive prologue; TypeScript, SWC and others follow suit.
const LEADING_COMMENTS_RE = /^(?:\s+|\/\/[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/;

/**
 * Offset in `code` immediately after the final directive-prologue statement.
 * Returns 0 when no directive is present (leading comments alone do not shift
 * the insert point — imports can precede comments safely).
 */
export function directivePrologueEnd(code: string): number {
    let pos = 0;
    while (true) {
        const slice = code.slice(pos);
        const commentM = LEADING_COMMENTS_RE.exec(slice);
        const commentLen = commentM ? commentM[0].length : 0;
        const after = slice.slice(commentLen);
        const dirM = LEADING_DIRECTIVE_RE.exec(after);
        if (!dirM) break;

        pos += commentLen + dirM[0].length;
    }
    return pos;
}

/**
 * Splice `inject` immediately after any leading directive prologue in `code`.
 * Preserves `'use client'` / `'use server'` as the first statement.
 */
export function insertAfterDirectives(code: string, lines: string[]): string {
    const inject = lines.join('\n') + '\n';
    const pos = directivePrologueEnd(code);
    if (pos === 0) return inject + code;
    return code.slice(0, pos) + inject + code.slice(pos);
}
