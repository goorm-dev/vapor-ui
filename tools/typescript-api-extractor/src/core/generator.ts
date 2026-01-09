import ts from 'typescript';

export interface GeneratorOptions {
    format?: 'json' | 'markdown';
    pretty?: boolean;
}

export interface GeneratedOutput {
    content: string;
    format: string;
}

/**
 * Generates output from analyzed API data
 * This module is reserved for future code generation features
 */
export function generate(_data: unknown, _options: GeneratorOptions = {}): GeneratedOutput {
    // TODO: Implement code generation logic
    return {
        content: '',
        format: 'json',
    };
}

/**
 * Creates a TypeScript AST node for a given code string
 */
export function createNode(code: string): ts.Node {
    const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
    return sourceFile.statements[0];
}

/**
 * Prints a TypeScript AST node to string
 */
export function printNode(node: ts.Node): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile(
        'temp.ts',
        '',
        ts.ScriptTarget.Latest,
        false,
        ts.ScriptKind.TS,
    );
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}
