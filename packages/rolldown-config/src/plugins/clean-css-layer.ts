import type { RolldownPlugin } from 'rolldown';

interface Options {
    ignores?: string[];
}

export const cleanLayerDeclaration = (options: Options = {}): RolldownPlugin => {
    const { ignores } = options;

    return {
        name: 'clean-css-layer-declarations',

        generateBundle(_options, bundle) {
            const layerDeclarationRegex = /^@layer vapor\.[a-zA-Z0-9_-]+;\s*/gm;
            const exceptions = ignores || ['styles/layers.css.ts.vanilla.css'];

            for (const fileName in bundle) {
                const file = bundle[fileName];

                if (
                    file.type === 'asset' &&
                    fileName.endsWith('.css') &&
                    !exceptions.includes(fileName)
                ) {
                    if (typeof file.source === 'string') {
                        file.source = file.source.replace(layerDeclarationRegex, '');
                    }
                }
            }
        },
    };
};
