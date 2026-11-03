import 'server-only';

import type { ReactNode } from 'react';

import { hastToReact } from '~/lib/hast-to-react';

import { extractTokens, highlightToHast } from './highlighter';

/**
 * Server-side highlights `code` to syntax-colored token nodes without any `<pre><code>`
 * wrapper. The caller is responsible for wrapping the result in a `<span>` (inline) or
 * `<pre>` (block). Returns the plain text unchanged when `code` is empty.
 */
export async function getHighlightTokens(code: string, lang = 'ts'): Promise<ReactNode> {
    if (!code) return code;
    const hast = await highlightToHast(code, lang);
    const tokens = extractTokens(hast);
    return hastToReact(tokens);
}
