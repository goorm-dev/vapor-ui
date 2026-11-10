import 'server-only';

import type { Element, ElementContent, Root } from 'hast';
import { type HighlighterCore, createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter() {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighterCore({
            themes: [
                import('shiki/themes/github-light.mjs'),
                import('shiki/themes/github-dark.mjs'),
            ],
            langs: [import('shiki/langs/ts.mjs')],
            engine: createJavaScriptRegexEngine(),
        }).catch((err) => {
            highlighterPromise = null;
            throw err;
        });
    }
    return highlighterPromise;
}

export async function highlightToHast(code: string, lang = 'ts'): Promise<Root> {
    const highlighter = await getHighlighter();
    return highlighter.codeToHast(code, {
        lang,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: false,
        transformers: [
            {
                span(node) {
                    const style = (node.properties.style as string | undefined) ?? '';
                    node.properties.style = style
                        .replace(
                            /--shiki-light:#24292E+/,
                            '--shiki-light:var(--vapor-color-foreground-normal)',
                        )
                        .replace(
                            /--shiki-dark:#E1E4E8+/,
                            '--shiki-dark:var(--vapor-color-foreground-normal)',
                        );
                },
            },
        ],
    });
}

/**
 * Strips shiki's outer `<pre><code>` wrapper, returning a HAST root whose children
 * are the token spans. Use this for inline chips where the surrounding `<pre>`
 * block (background, padding) is not wanted.
 */
export function extractTokens(root: Root): Root {
    const pre = root.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'pre',
    );
    if (!pre) return root;

    const code = pre.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
    );
    if (!code) return root;

    return { type: 'root', children: code.children as ElementContent[] };
}
