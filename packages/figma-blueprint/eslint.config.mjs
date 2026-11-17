import { configs } from '@repo/eslint-config/base';
import { config as imports } from '@repo/eslint-config/import';
import { fileURLToPath } from 'node:url';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

// Every module lists what it may import (`except`); everything else under src is off limits. A new top-level file
// (a new command) is not a target, so it may import anything, and nothing listed here may import it.
const zones = [
    // The leaves: Figma's REST API, the package list, Code Connect's files.
    {
        target: ['./src/figma.ts', './src/packages.ts', './src/code-connect/files.ts'],
        from: './src',
        message: 'a leaf module imports nothing from src',
    },
    {
        target: './src/code-connect',
        from: './src',
        except: ['./code-connect', './figma.ts'],
        message: 'Code Connect reads only Figma node types',
    },
    {
        target: './src/entries.ts',
        from: './src',
        except: ['./figma.ts', './packages.ts', './code-connect/files.ts'],
    },
    {
        target: './src/catalog',
        from: './src',
        except: ['./catalog', './entries.ts', './packages.ts', './code-connect'],
    },
    {
        target: './src/library.ts',
        from: './src',
        except: ['./figma.ts', './entries.ts', './packages.ts'],
    },
    {
        target: './src/blueprint',
        from: './src',
        except: [
            './blueprint',
            './packages.ts',
            './figma.ts',
            './code-connect/stand-in.ts',
            './catalog/catalog.ts',
        ],
        message: 'the walk runs templates through stand-in.ts and reads only Catalog types',
    },
    // Module internals: reachable only from inside their folder.
    {
        target: './src/*.ts',
        from: [
            './src/blueprint/design.ts',
            './src/catalog/tables.ts',
            './src/code-connect/compile.ts',
        ],
        message: 'import the module (blueprint/output.ts, catalog/catalog.ts), not its internals',
    },
    { target: './src', from: ['./src/cli.ts', './src/index.ts'], message: 'entry points only' },
];

// RFC-0002: the stand-in, blueprint and design take data only. Types from I/O modules, never values.
const typesOnly = (...group) => ({ group, allowTypeImports: true, message: 'pure: types only' });
const pure = [
    { group: ['node:*'], message: 'pure: no I/O' },
    typesOnly('~/figma', '../figma'),
    typesOnly('~/catalog/*', '../catalog/*'),
    typesOnly('~/code-connect/files', './files'),
    { group: ['~/code-connect/compile', './compile'], message: 'pure: no compiling' },
];

export default [
    ...configs,
    imports,
    { ignores: ['dist', 'node_modules', 'coverage', 'src/__fixtures__'] },
    {
        // @repo/eslint-config/import sets `import/resolver`, which import-x 4 does not read: `~/` would not resolve and
        // every zone would pass silently. no-unresolved fails the lint if that ever happens again.
        settings: { 'import-x/resolver': { typescript: { project: here('./tsconfig.json') } } },
        rules: { 'import/no-unresolved': 'error' },
    },
    {
        files: ['src/**/*.ts'],
        ignores: ['src/**/*.test.ts'],
        rules: { 'import/no-restricted-paths': ['error', { basePath: here('.'), zones }] },
    },
    {
        files: ['src/**/*.ts'],
        ignores: ['src/figma.ts', 'src/**/*.test.ts'],
        rules: {
            'no-restricted-globals': [
                'error',
                { name: 'fetch', message: 'Figma requests go through figma.ts' },
            ],
        },
    },
    {
        files: ['src/blueprint/**/*.ts', 'src/code-connect/stand-in.ts'],
        ignores: ['src/**/*.test.ts'],
        rules: { '@typescript-eslint/no-restricted-imports': ['error', { patterns: pure }] },
    },
];
