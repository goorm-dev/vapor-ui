import { configs } from '@repo/eslint-config/base';

/**
 * Layer boundaries.
 *
 * domain/ holds the rules that define what a documented component is. It must
 * stay free of ts-morph, the filesystem and the console so the rules can be read
 * and tested without a TypeScript program. infrastructure/ may use anything, but
 * must not reach up into cli/ or app/.
 */
const layerBoundaries = {
    files: ['src/domain/**/*.ts'],
    rules: {
        'no-restricted-imports': [
            'error',
            {
                patterns: [
                    {
                        group: ['ts-morph', 'node:*', 'glob', 'meow'],
                        message:
                            'domain/ must stay dependency-free. Put anything touching ts-morph, the filesystem or the CLI in infrastructure/.',
                    },
                    {
                        group: ['~/infrastructure/*', '~/cli/*', '~/app/*'],
                        message: 'domain/ must not depend on outer layers.',
                    },
                ],
            },
        ],
    },
};

const infrastructureBoundaries = {
    files: ['src/infrastructure/**/*.ts'],
    rules: {
        'no-restricted-imports': [
            'error',
            {
                patterns: [
                    {
                        group: ['~/cli/*', '~/app/*'],
                        message: 'infrastructure/ must not depend on the CLI or the app layer.',
                    },
                ],
            },
        ],
    },
};

export default [...configs, layerBoundaries, infrastructureBoundaries];
