import ts from 'typescript';
import path from 'node:path';

export interface ParserOptions {
  tsconfig?: string;
  rootDir?: string;
}

export interface ParseResult {
  program: ts.Program;
  checker: ts.TypeChecker;
  sourceFiles: ts.SourceFile[];
}

/**
 * Creates a TypeScript program from entry files
 */
export function createProgram(
  entryFiles: string[],
  options: ParserOptions = {}
): ParseResult {
  const compilerOptions = loadCompilerOptions(options.tsconfig);

  const program = ts.createProgram(entryFiles, compilerOptions);
  const checker = program.getTypeChecker();

  const sourceFiles = program
    .getSourceFiles()
    .filter((sf) => !sf.isDeclarationFile && entryFiles.some((entry) => sf.fileName.includes(entry)));

  return { program, checker, sourceFiles };
}

/**
 * Loads compiler options from tsconfig.json
 */
function loadCompilerOptions(tsconfigPath?: string): ts.CompilerOptions {
  if (!tsconfigPath) {
    return {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    };
  }

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(`Failed to read tsconfig: ${tsconfigPath}`);
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );

  return parsedConfig.options;
}

/**
 * Parses a single TypeScript file and returns its AST
 */
export function parseFile(filePath: string): ts.SourceFile {
  const content = ts.sys.readFile(filePath);
  if (!content) {
    throw new Error(`Failed to read file: ${filePath}`);
  }

  return ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
}
