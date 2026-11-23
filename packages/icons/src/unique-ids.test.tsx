import { renderToString } from 'react-dom/server';

import { expect, test } from 'vitest';

import * as icons from '~/index';

const idsOf = (html: string) => [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
const refsOf = (html: string) => [...html.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);

const iconsWithIds = Object.entries(icons).filter(
    ([, Icon]) => idsOf(renderToString(<Icon />)).length > 0,
);

test('some icons carry SVG ids, so the check below is not vacuous', () => {
    expect(iconsWithIds.length).toBeGreaterThan(0);
});

test.each(iconsWithIds)('%s rendered twice keeps every id unique and resolvable', (_, Icon) => {
    const html = renderToString(
        <>
            <Icon />
            <Icon />
        </>,
    );
    const ids = idsOf(html);

    expect(new Set(ids).size).toBe(ids.length);
    for (const ref of refsOf(html)) expect(ids).toContain(ref);
});
