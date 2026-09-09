import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import { iconComponentIndex, iconsIndex } from './index-generator';

type WriteResult = 'new' | 'updated' | 'unchanged';

/**
 * Format with the repo's prettier config (plugins included) so generated files match what
 * `pnpm format` produces. `resolveConfig` caches per path, so calling it per file is cheap.
 */
const format = async (source: string, filepath: string) =>
    prettier.format(source, { ...(await prettier.resolveConfig(filepath)), filepath });

/**
 * Write `<Name>/<Name>.tsx` and `<Name>/index.ts`. Nothing is touched when the component source
 * is already identical, so unchanged icons leave no git diff.
 */
const writeIcon = async (
    targetDir: string,
    iconName: string,
    component: string,
): Promise<WriteResult> => {
    const dir = path.join(targetDir, iconName);
    const componentFile = path.join(dir, `${iconName}.tsx`);
    const indexFile = path.join(dir, 'index.ts');

    const [formatted, formattedIndex] = await Promise.all([
        format(component, componentFile),
        format(iconComponentIndex(iconName), indexFile),
    ]);
    const [existing, existingIndex] = await Promise.all([
        fs.readFile(componentFile, 'utf8').catch(() => null),
        fs.readFile(indexFile, 'utf8').catch(() => null),
    ]);
    // Both files decide: a missing or stale `index.ts` would otherwise never be regenerated,
    // and the entry index imports the folder, so one missing file breaks the whole build.
    if (existing === formatted && existingIndex === formattedIndex) return 'unchanged';

    await fs.mkdir(dir, { recursive: true });
    await Promise.all([
        fs.writeFile(componentFile, formatted),
        fs.writeFile(indexFile, formattedIndex),
    ]);
    return existing === null ? 'new' : 'updated';
};

/**
 * Delete icon folders that Figma no longer has. Returns the removed names.
 */
const removeStaleIcons = async (targetDir: string, keep: Iterable<string>): Promise<string[]> => {
    const wanted = new Set(keep);
    const stale = (await fs.readdir(targetDir, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory() && !wanted.has(entry.name))
        .map((entry) => entry.name);

    await Promise.all(
        stale.map((name) => fs.rm(path.join(targetDir, name), { recursive: true, force: true })),
    );
    return stale;
};

/**
 * Rewrite the type's entry `index.ts`, listing icons in the given order.
 */
const writeIconsIndex = async (targetDir: string, iconNames: string[]): Promise<void> => {
    const indexFile = path.join(targetDir, 'index.ts');
    await fs.writeFile(indexFile, await format(iconsIndex(iconNames), indexFile));
};

export type { WriteResult };
export { removeStaleIcons, writeIcon, writeIconsIndex };
