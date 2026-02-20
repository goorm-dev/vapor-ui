import fs from 'node:fs';
import path from 'node:path';

import { CliError } from './errors.js';
import { validateComponent } from './options.js';
import type { ScannedComponent } from './types.js';

// Dynamic import to avoid loading @inquirer/prompts in CI environments
async function getPrompts() {
    try {
        return await import('@inquirer/prompts');
    } catch {
        throw new CliError(
            'Interactive mode requires @inquirer/prompts. ' +
                'Provide --path and --component CLI arguments instead, or install: pnpm add @inquirer/prompts',
        );
    }
}

const SELECT_ALL_VALUE = '__SELECT_ALL__';

// ============================================================
// Step 1: Path Resolution (CLI > Prompt)
// ============================================================

export async function resolvePath(filePath?: string): Promise<string> {
    const cwd = process.cwd();

    if (filePath) {
        const absolutePath = path.resolve(cwd, filePath);
        if (!fs.existsSync(absolutePath)) {
            throw new CliError(`Path does not exist: ${absolutePath}`);
        }
        return absolutePath;
    }

    const { input } = await getPrompts();
    const inputPath = await input({
        message: '컴포넌트 경로를 입력하세요:',
        default: '.',
        validate: (value: string) => {
            const resolved = path.resolve(cwd, value.trim());
            if (!fs.existsSync(resolved)) {
                return `경로가 존재하지 않습니다: ${resolved}`;
            }
            return true;
        },
    });

    return path.resolve(cwd, inputPath.trim());
}

// ============================================================
// Step 3: Component Selection (CLI > Checkbox Prompt)
// ============================================================

export async function resolveComponentSelection(
    scannedComponents: ScannedComponent[],
    cliComponent?: string,
): Promise<string[]> {
    // Case A: CLI option provided - validate against scanned files
    if (cliComponent) {
        const validation = validateComponent(scannedComponents, cliComponent);

        if (!validation.valid) {
            throw new CliError(
                `Component '${cliComponent}' not found.\nAvailable: ${validation.available.join(', ')}`,
            );
        }

        return [validation.file];
    }

    // Case B: No CLI option - show interactive checkbox prompt
    const choices = [
        { name: '[ 전체 선택 ]', value: SELECT_ALL_VALUE },
        ...scannedComponents.map((comp) => ({
            name: comp.componentName,
            value: comp.filePath,
        })),
    ];

    const { checkbox } = await getPrompts();
    const selected = await checkbox({
        message: '추출할 컴포넌트를 선택하세요:',
        choices,
        required: true,
    });

    if (selected.includes(SELECT_ALL_VALUE)) {
        return scannedComponents.map((c) => c.filePath);
    }

    return selected;
}
