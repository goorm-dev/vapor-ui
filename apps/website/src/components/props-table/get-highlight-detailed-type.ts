import 'server-only';

import type { ReactNode } from 'react';

import type { Element, ElementContent, Text as HastText, Root } from 'hast';

import { hastToReact } from '~/lib/hast-to-react';

import { getHighlightTokens } from './get-highlight-tokens';
import { highlightToHast } from './highlighter';
import type { DetailedTypeSegment } from './types';

type Piece = { kind: 'span'; span: Element; refName?: string } | { kind: 'text'; text: string };

interface FlatToken {
    kind: 'span' | 'text';
    span?: Element;
    text: string;
    start: number;
    end: number;
    isStringOrComment: boolean;
}

interface RefMatch {
    start: number;
    end: number;
    refName: string;
    firstTokenIdx: number;
    lastTokenIdx: number;
}

interface Group {
    refName?: string;
    pieces: Piece[];
}

export async function getHighlightDetailedType(
    raw: string,
    typeRefs: Record<string, string> | undefined,
): Promise<DetailedTypeSegment[]> {
    if (!raw) return [];

    const refNames = typeRefs
        ? Object.keys(typeRefs)
              .filter((name) => raw.includes(name))
              .sort((a, b) => b.length - a.length)
        : [];

    const hast = await highlightToHast(raw, 'ts');
    const tokens = flattenTokens(hast);

    const matches = refNames.length > 0 ? findRefMatches(raw, tokens, refNames) : [];
    const pieces = buildPieces(tokens, matches);
    const groups = groupPieces(pieces);

    const definitions = typeRefs
        ? await resolveDefinitions(new Set(matches.map((m) => m.refName)), typeRefs)
        : new Map<string, ReactNode>();

    return groups.map((group) => {
        const node = renderGroup(group);
        if (!group.refName) return { kind: 'plain', node };
        return {
            kind: 'ref',
            node,
            refName: group.refName,
            definition: definitions.get(group.refName) ?? '',
        };
    });
}

async function resolveDefinitions(refNames: Set<string>, typeRefs: Record<string, string>) {
    const entries = await Promise.all(
        [...refNames].map(
            async (name) => [name, await getHighlightTokens(typeRefs[name])] as const,
        ),
    );
    return new Map(entries);
}

/**
 * Walks the shiki `<pre><code>` wrapper and returns leaf token spans plus
 * inter-line newline text nodes in document order. Each token carries its
 * `[start, end)` offset into the full raw string so a later pass can match
 * reference names that span multiple tokens (e.g. shiki splits
 * `Dialog.Root` into three tokens inside a function signature).
 */
function flattenTokens(hast: Root) {
    const pre = hast.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'pre',
    );
    if (!pre) return [];

    const code = pre.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
    );
    if (!code) return [];

    const tokens: FlatToken[] = [];
    let offset = 0;
    const push = (token: Omit<FlatToken, 'start' | 'end'>) => {
        const start = offset;
        const end = start + token.text.length;
        offset = end;
        tokens.push({ ...token, start, end });
    };

    for (const child of code.children) {
        if (child.type === 'text') {
            push({ kind: 'text', text: child.value, isStringOrComment: false });
            continue;
        }
        if (child.type !== 'element' || child.tagName !== 'span') continue;

        for (const tokenNode of child.children) {
            if (tokenNode.type === 'text') {
                push({ kind: 'text', text: tokenNode.value, isStringOrComment: false });
                continue;
            }
            if (tokenNode.type !== 'element' || tokenNode.tagName !== 'span') continue;

            const text = getSpanText(tokenNode);
            push({
                kind: 'span',
                span: tokenNode,
                text,
                isStringOrComment: isStringOrCommentToken(text),
            });
        }
    }
    return tokens;
}

/**
 * Scans the full raw string for reference names, honoring identifier
 * boundaries and skipping any match that overlaps a string- or comment-scope
 * token (false-positive guard for identifier names reused inside quoted
 * literals or line/block comments). Matches are non-overlapping and chosen
 * longest-first so that `Dialog.Root` wins over `Dialog` when both are refs.
 */
function findRefMatches(raw: string, tokens: FlatToken[], refNames: string[]) {
    const matches: RefMatch[] = [];
    let cursor = 0;

    while (cursor < raw.length) {
        const start = cursor;
        const hit = refNames.find(
            (name) => raw.startsWith(name, start) && isIdentifierBoundary(raw, start, name.length),
        );

        if (!hit) {
            cursor++;
            continue;
        }

        const end = start + hit.length;
        const range = findTokenRange(tokens, start, end);

        if (!range || overlapsStringOrComment(tokens, range.firstTokenIdx, range.lastTokenIdx)) {
            cursor++;
            continue;
        }

        matches.push({ start, end, refName: hit, ...range });
        cursor = end;
    }

    return matches;
}

function findTokenRange(tokens: FlatToken[], start: number, end: number) {
    const firstTokenIdx = tokens.findIndex((t) => t.start <= start && start < t.end);
    if (firstTokenIdx === -1) return null;

    let lastTokenIdx = firstTokenIdx;
    while (lastTokenIdx < tokens.length && tokens[lastTokenIdx].end < end) {
        lastTokenIdx++;
    }
    if (lastTokenIdx >= tokens.length) return null;
    return { firstTokenIdx, lastTokenIdx };
}

function overlapsStringOrComment(tokens: FlatToken[], first: number, last: number) {
    for (let i = first; i <= last; i++) {
        if (tokens[i].isStringOrComment) return true;
    }
    return false;
}

/**
 * Walks tokens in order, slicing those that fall inside a ref match range so
 * the matched substring is isolated into its own piece. Tokens outside any
 * match are emitted unchanged. All sliced spans inherit the original token's
 * hast properties so shiki's syntax colors survive the split.
 */
function buildPieces(tokens: FlatToken[], matches: RefMatch[]) {
    const pieces: Piece[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const touching = matches.filter((m) => m.firstTokenIdx <= i && i <= m.lastTokenIdx);

        if (touching.length === 0) {
            pieces.push(toPiece(token));
            continue;
        }

        if (token.kind !== 'span' || !token.span) {
            pieces.push(toPiece(token));
            continue;
        }

        let cursor = token.start;
        for (const match of touching) {
            const sliceStart = Math.max(match.start, token.start);
            const sliceEnd = Math.min(match.end, token.end);

            if (cursor < sliceStart) {
                pieces.push({
                    kind: 'span',
                    span: cloneSpanWithText(
                        token.span,
                        token.text.slice(cursor - token.start, sliceStart - token.start),
                    ),
                });
            }

            pieces.push({
                kind: 'span',
                span: cloneSpanWithText(
                    token.span,
                    token.text.slice(sliceStart - token.start, sliceEnd - token.start),
                ),
                refName: match.refName,
            });
            cursor = sliceEnd;
        }

        if (cursor < token.end) {
            pieces.push({
                kind: 'span',
                span: cloneSpanWithText(token.span, token.text.slice(cursor - token.start)),
            });
        }
    }

    return pieces;
}

function toPiece(token: FlatToken): Piece {
    if (token.kind === 'span' && token.span) return { kind: 'span', span: token.span };
    return { kind: 'text', text: token.text };
}

function groupPieces(pieces: Piece[]) {
    const groups: Group[] = [];
    for (const piece of pieces) {
        const refName = piece.kind === 'span' ? piece.refName : undefined;
        const last = groups[groups.length - 1];
        if (last && last.refName === refName) {
            last.pieces.push(piece);
        } else {
            groups.push({ refName, pieces: [piece] });
        }
    }
    return groups;
}

function renderGroup(group: Group) {
    const children: ElementContent[] = group.pieces.map((piece) =>
        piece.kind === 'span' ? piece.span : ({ type: 'text', value: piece.text } as HastText),
    );
    return hastToReact({ type: 'root', children });
}

function getSpanText(span: Element) {
    return span.children.map((child) => (child.type === 'text' ? child.value : '')).join('');
}

function cloneSpanWithText(span: Element, text: string): Element {
    return {
        ...span,
        properties: { ...span.properties },
        children: [{ type: 'text', value: text }],
    };
}

function isIdentifierBoundary(text: string, start: number, length: number) {
    const prev = text[start - 1];
    const next = text[start + length];
    return !isIdChar(prev) && !isIdChar(next);
}

function isIdChar(c: string | undefined) {
    return !!c && /[A-Za-z0-9_$]/.test(c);
}

function isStringOrCommentToken(text: string) {
    const trimmed = text.trimStart();
    if (!trimmed) return false;
    if (trimmed.startsWith("'") || trimmed.startsWith('"') || trimmed.startsWith('`')) return true;
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return true;
    return false;
}
