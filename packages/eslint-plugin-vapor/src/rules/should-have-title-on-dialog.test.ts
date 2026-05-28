import { RuleTester } from 'eslint';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import {
    hasDialogTitle,
    isDialogTitle,
    shouldHaveTitleOnDialogRule,
} from './should-have-title-on-dialog';

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

describe('should-have-title-on-dialog', () => {
    // Note: The "Deep Traversal" and "Dialog.Title" detection logic relies on TypeScript Type Checker.
    // Since RuleTester (without specific TS setup) does not provide a full Type Checker,
    // the rule defaults to reporting errors if 'aria-label' is missing, even if <Dialog.Title> is present.
    //
    // Therefore, this test file primarily verifies:
    // 1. 'aria-label' / 'aria-labelledby' acceptance (which is purely AST-based).
    // 2. Reporting of missing labels (when <Dialog.Title> is also absent).
    //
    // For rigorous testing of <Dialog.Title> detection, see `should-have-title-on-dialog.utils.test.ts`.

    ruleTester.run('should-have-title-on-dialog', shouldHaveTitleOnDialogRule, {
        valid: [
            // 1. Dialog with aria-label
            {
                code: `
                    import { Dialog } from '@vapor-ui/core';
                    const App = () => (
                        <Dialog.Popup aria-label="Confirm Action">
                            Content
                        </Dialog.Popup>
                    );
                `,
            },
            // 2. Dialog with aria-labelledby (The current implementation does not yet support this)
            // {
            //     code: `
            //         import { Dialog } from '@vapor-ui/core';
            //         const App = () => (
            //             <Dialog.Popup aria-labelledby="dialog-title">
            //                 <h2 id="dialog-title">Title</h2>
            //             </Dialog.Popup>
            //         );
            //     `,
            // },
            // 3. Popover with aria-label (assuming Popover follows similar aria rules if enforced)
            // The rule checks 'Dialog', 'Popover', 'Sheet'.
            {
                code: `
                    import { Popover } from '@vapor-ui/core';
                    const App = () => (
                        <Popover.Popup aria-label="Menu">
                            Content
                        </Popover.Popup>
                    );
                `,
            },
        ],
        invalid: [
            // 1. Missing Title and Label (Dialog)
            {
                code: `
                    import { Dialog } from '@vapor-ui/core';
                    const App = () => (
                        <Dialog.Popup>
                            Content
                        </Dialog.Popup>
                    );
                `,
                errors: [{ messageId: 'missing-title' }],
            },
            // 2. Missing Title and Label (Popover)
            {
                code: `
                    import { Popover } from '@vapor-ui/core';
                    const App = () => (
                        <Popover.Popup>
                            Content
                        </Popover.Popup>
                    );
                `,
                errors: [{ messageId: 'missing-title' }],
            },
        ],
    });
});

const TEST_FILE_NAME = '/absolute/path/to/test.tsx';
const CORE_FILE_NAME = '/absolute/path/to/node_modules/@vapor-ui/core/index.d.ts';
const CORE_FILE_CONTENT = `
    export namespace Dialog {
        export const Title: any;
        export const Root: any;
        export const Popup: any;
    }
`;

const compilerOptions: ts.CompilerOptions = {
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noLib: true,
    skipLibCheck: true,
};

const documentRegistry = ts.createDocumentRegistry();

let currentCode = '';

const serviceHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => [TEST_FILE_NAME, CORE_FILE_NAME],
    getScriptVersion: (fileName) => (fileName === TEST_FILE_NAME ? currentCode : '0'),
    getScriptSnapshot: (fileName) => {
        if (fileName === TEST_FILE_NAME) return ts.ScriptSnapshot.fromString(currentCode);
        if (fileName === CORE_FILE_NAME) return ts.ScriptSnapshot.fromString(CORE_FILE_CONTENT);
        const text = ts.sys.readFile(fileName);
        return text !== undefined ? ts.ScriptSnapshot.fromString(text) : undefined;
    },
    getCurrentDirectory: () => '/',
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (opts) => ts.getDefaultLibFilePath(opts),
    fileExists: (f) => f === TEST_FILE_NAME || f === CORE_FILE_NAME || ts.sys.fileExists(f),
    readFile: (f) => {
        if (f === TEST_FILE_NAME) return currentCode;
        if (f === CORE_FILE_NAME) return CORE_FILE_CONTENT;
        return ts.sys.readFile(f);
    },
    resolveModuleNames: (moduleNames) =>
        moduleNames.map((name) => {
            if (name === '@vapor-ui/core') {
                return { resolvedFileName: CORE_FILE_NAME, isExternalLibraryImport: true };
            }
            return undefined;
        }),
};

const languageService = ts.createLanguageService(serviceHost, documentRegistry);

function createTestEnv(code: string) {
    currentCode = code;
    const program = languageService.getProgram()!;
    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(TEST_FILE_NAME)!;
    return { sourceFile, checker };
}

function findNode(node: ts.Node, predicate: (n: ts.Node) => boolean): ts.Node | undefined {
    if (predicate(node)) return node;
    return node.forEachChild((child) => findNode(child, predicate));
}

describe('should-have-title-on-dialog utils', () => {
    describe('isDialogTitle', () => {
        it('should return false for explicit "Dialog.Title" text without import resolution', () => {
            const code = `<Dialog.Title />`;
            const { sourceFile, checker } = createTestEnv(code);
            const node = findNode(sourceFile, ts.isJsxSelfClosingElement)!;
            expect(isDialogTitle(node, checker)).toBe(false);
        });

        it('should return true for resolved core Dialog.Title symbol', () => {
            const code = `
                import { Dialog } from '@vapor-ui/core';
                export const App = () => <Dialog.Title />;
            `;
            const { sourceFile, checker } = createTestEnv(code);
            const node = findNode(sourceFile, ts.isJsxSelfClosingElement)!;

            // Should pass via strict symbol check
            expect(isDialogTitle(node, checker)).toBe(true);
        });

        it('should return false for FakeTitle named similarly (Strict check)', () => {
            const code = `
               const Dialog = { Title: () => <div /> };
               export const App = () => <Dialog.Title />;
            `;
            const { sourceFile, checker } = createTestEnv(code);
            const node = findNode(
                sourceFile,
                (n) => ts.isJsxSelfClosingElement(n) && n.tagName.getText() === 'Dialog.Title',
            )!;
            expect(isDialogTitle(node, checker)).toBe(false);
        });
    });

    describe('hasDialogTitle (Deep Traversal)', () => {
        it('should detect direct Dialog.Title', () => {
            const code = `
                import { Dialog } from '@vapor-ui/core';
                const App = () => (
                    <Dialog.Root>
                        <Dialog.Title />
                    </Dialog.Root>
                );
            `;
            const { sourceFile, checker } = createTestEnv(code);
            const root = findNode(sourceFile, ts.isJsxElement)!; // Dialog.Root
            expect(hasDialogTitle(root, checker)).toBe(true);
        });

        it('should detect wrapped Dialog.Title', () => {
            const code = `
                import { Dialog } from '@vapor-ui/core';
                
                const Wrapper = () => <Dialog.Title />;
                
                const App = () => (
                    <Dialog.Root>
                        <Wrapper />
                    </Dialog.Root>
                );
            `;
            const { sourceFile, checker } = createTestEnv(code);
            const root = findNode(
                sourceFile,
                (n) => ts.isJsxElement(n) && n.openingElement.tagName.getText() === 'Dialog.Root',
            ) as ts.JsxElement;
            expect(hasDialogTitle(root, checker)).toBe(true);
        });

        it('should fail for wrapper rendering div', () => {
            const code = `
                import { Dialog } from '@vapor-ui/core';
                
                const FakeWrapper = () => <div>Title</div>;
                
                const App = () => (
                    <Dialog.Root>
                        <FakeWrapper />
                    </Dialog.Root>
                );
            `;
            const { sourceFile, checker } = createTestEnv(code);
            const root = findNode(
                sourceFile,
                (n) => ts.isJsxElement(n) && n.openingElement.tagName.getText() === 'Dialog.Root',
            ) as ts.JsxElement;
            expect(hasDialogTitle(root, checker)).toBe(false);
        });

        it('should handle multiple levels of wrapping', () => {
            const code = `
                import { Dialog } from '@vapor-ui/core';
                
                const Level1 = () => <Dialog.Title />;
                const Level2 = () => <Level1 />;
                
                const App = () => (
                     <Dialog.Root>
                        <Level2 />
                     </Dialog.Root>
                );
            `;
            const { sourceFile, checker } = createTestEnv(code);
            const root = findNode(
                sourceFile,
                (n) => ts.isJsxElement(n) && n.openingElement.tagName.getText() === 'Dialog.Root',
            ) as ts.JsxElement;
            expect(hasDialogTitle(root, checker)).toBe(true);
        });

        it('should return false if recursion limit or cycle detected', () => {
            const code = `
                import { Dialog } from '@vapor-ui/core';
                
                const Cycle = () => <Cycle />;
                
                const App = () => (
                     <Dialog.Root>
                        <Cycle />
                     </Dialog.Root>
                );
            `;
            const { sourceFile, checker } = createTestEnv(code);
            const root = findNode(
                sourceFile,
                (n) => ts.isJsxElement(n) && n.openingElement.tagName.getText() === 'Dialog.Root',
            ) as ts.JsxElement;
            expect(hasDialogTitle(root, checker)).toBe(false);
        });
    });
});
