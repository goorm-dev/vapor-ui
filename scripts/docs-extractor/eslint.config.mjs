import { configs } from '@repo/eslint-config/base';

/**
 * Module boundaries.
 *
 * policy.ts holds the rules that decide what a documented component looks like.
 * It stays free of ts-morph, the filesystem and the console so every rule can be
 * read and tested with plain data. read/ turns source into ParsedComponent and
 * must not reach up into the policy, the writer or the CLI.
 *
 * These patterns use gitignore syntax, where a leading `#` starts a comment,
 * so the subpath imports are written with an escaped `\#`.
 */
const policyBoundaries = {
    files: ['src/policy.ts', 'src/model.ts'],
    rules: {
        'no-restricted-imports': [
            'error',
            {
                patterns: [
                    {
                        group: ['ts-morph', 'node:*', 'glob', 'meow'],
                        message:
                            'The policy must stay dependency-free. Put anything touching ts-morph or the filesystem in read/.',
                    },
                    {
                        group: ['\\#read/*', '\\#extract', '\\#write', '\\#cli'],
                        message: 'The policy must not depend on reading, writing or the CLI.',
                    },
                ],
            },
        ],
    },
};

const readBoundaries = {
    files: ['src/read/**/*.ts'],
    rules: {
        'no-restricted-imports': [
            'error',
            {
                patterns: [
                    {
                        group: ['\\#policy', '\\#extract', '\\#write', '\\#cli'],
                        message:
                            'read/ only turns source into ParsedComponent; the policy, writing and the CLI sit on top of it.',
                    },
                ],
            },
        ],
    },
};

export default [...configs, policyBoundaries, readBoundaries];
