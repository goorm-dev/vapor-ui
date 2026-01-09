// Core modules
export { createProgram, parseFile, type ParserOptions, type ParseResult } from './core/parser.js';
export {
  analyze,
  extractExportsFromFile,
  type AnalyzeOptions,
  type AnalyzeResult,
  type ExportInfo,
  type ExportKind,
} from './core/analyzer.js';
export {
  generate,
  createNode,
  printNode,
  type GeneratorOptions,
  type GeneratedOutput,
} from './core/generator.js';

// Utilities
export {
  resolvePath,
  fileExists,
  readJsonFile,
  writeFile,
  getRelativePath,
  normalizePath,
} from './utils/index.js';
