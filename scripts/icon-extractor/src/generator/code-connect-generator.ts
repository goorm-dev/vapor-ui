import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import type { IconNode } from '~/api/types';
import type { IconType, IconTypeConfig } from '~/config';
import { figma } from '~/config';
import { REPO_ROOT } from '~/utils/file-system';
import { normalizeIconName } from '~/utils/icon-name';

/** Every icon shares one template; the batch file only carries the per-icon data. */
const TEMPLATE_FILE = './icon.figma.batch.ts';
const PACKAGE_DIR = 'packages/icons';
const FIGMA_DESIGN_URL = 'https://www.figma.com/design';

/** One entry of a `.figma.batch.json` file. */
type BatchEntry = { url: string; component: string; source: string };

const toBatchEntry = (node: IconNode, targetPath: string): BatchEntry => {
    const component = normalizeIconName(node.name);

    return {
        url: `${FIGMA_DESIGN_URL}/${figma.fileKey}?node-id=${node.id.replace(':', '-')}`,
        component,
        // Package-relative, matching @vapor-ui/composites' Code Connect files.
        source: `${path.relative(PACKAGE_DIR, targetPath)}/${component}/${component}.tsx`,
    };
};

/**
 * Write `packages/icons/src/icons-<type>.figma.batch.json` — the Code Connect mapping between
 * the Figma icon components and their React counterparts.
 *
 * Written from the same node list the components are generated from, so the Figma node ids can
 * never drift from what got synced. Publish with `pnpm --filter @vapor-ui/icons figma:publish`.
 */
const writeCodeConnectBatch = async (
    type: IconType,
    { targetPath }: IconTypeConfig,
    nodes: IconNode[],
): Promise<string> => {
    const entries = nodes
        .map((node) => toBatchEntry(node, targetPath))
        .sort((a, b) => a.component.localeCompare(b.component));

    // Two Figma nodes normalizing to one component name would silently map the same snippet
    // twice — and the component generator would have written one folder for both.
    const names = entries.map(({ component }) => component);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
        throw new Error(
            `Duplicate icon component names in the Figma "${type}" frames: ${duplicates.join(', ')}`,
        );
    }

    const outFile = path.join(REPO_ROOT, PACKAGE_DIR, 'src', `icons-${type}.figma.batch.json`);
    const json = JSON.stringify({ templateFile: TEMPLATE_FILE, components: entries });
    await fs.writeFile(
        outFile,
        await prettier.format(json, {
            ...(await prettier.resolveConfig(outFile)),
            filepath: outFile,
        }),
    );

    return outFile;
};

export type { BatchEntry };
export { writeCodeConnectBatch };
