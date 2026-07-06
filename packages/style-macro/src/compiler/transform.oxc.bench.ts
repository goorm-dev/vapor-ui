import { bench, describe } from 'vitest';

import type { ManifestShape } from '~/model/types';

import { transform } from './transform';

const MANIFEST: ManifestShape = {
    version: '1',
    tokens: {
        color: { primary: '--vapor-color-primary' },
        space: { '400': '--vapor-size-space-400', '200': '--vapor-size-space-200' },
        dimension: {},
        borderRadius: {},
        shadow: {},
        typography: {},
    },
    propertyScopes: {
        padding: 'space',
        color: 'color',
    },
};

function makeSource(callCount: number): string {
    const lines: string[] = [`import { $style } from '@vapor-ui/style-macro';`];
    for (let i = 0; i < callCount; i++) {
        lines.push(`export const c${i} = $style({ padding: '$400', color: '$primary' });`);
    }
    return lines.join('\n');
}

describe('transform bench', () => {
    const small = makeSource(10);
    const medium = makeSource(100);
    const large = makeSource(1000);

    bench('small (10 calls)', () => {
        transform({ source: small, filename: '/small.tsx', manifest: MANIFEST });
    });

    bench('medium (100 calls)', () => {
        transform({ source: medium, filename: '/medium.tsx', manifest: MANIFEST });
    });

    bench('large (1000 calls)', () => {
        transform({ source: large, filename: '/large.tsx', manifest: MANIFEST });
    });
});
