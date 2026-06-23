import type { ManifestShape } from '../../src/types';

export const manifest: ManifestShape = {
    version: '1',
    tokens: {
        color: {
            primary: '--vapor-color-primary',
            'bg-gray-100': '--vapor-color-background-canvas-100',
        },
        space: {
            '100': '--vapor-size-space-100',
            '200': '--vapor-size-space-200',
            '400': '--vapor-size-space-400',
            '600': '--vapor-size-space-600',
        },
        dimension: { '100': '--vapor-size-dimension-100' },
        borderRadius: { '200': '--vapor-size-borderRadius-200' },
        shadow: { '100': '--vapor-shadow-100' },
        typography: {},
    },
    propertyScopes: {
        padding: 'space',
        paddingTop: 'space',
        margin: 'space',
        gap: 'space',
        backgroundColor: 'color',
        color: 'color',
        borderColor: 'color',
        width: 'dimension',
        height: 'dimension',
        borderRadius: 'borderRadius',
        boxShadow: 'shadow',
    },
};
