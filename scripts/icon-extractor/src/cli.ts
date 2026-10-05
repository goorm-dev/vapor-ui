/**
 * Sync icons from Figma into `@vapor-ui/icons` as React components.
 *
 * Usage:
 *   tsx --env-file=.env ./src/cli.ts --type=basic|symbol
 *
 * Requires FIGMA_TOKEN. Records what changed in `.sync-summary/<type>.json`, which
 * `write-release-notes` turns into the changeset and PR body.
 */
import path from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';
import pLimit from 'p-limit';

import { ICON_TYPE_NAMES, colorFrameIds, figma, iconTypes, isIconType } from '~/config';
import { downloadSvg, fetchIconNodes, resolveSvgUrls } from '~/downloader/svg-downloader';
import type { WriteResult } from '~/generator/component-generator';
import { removeStaleIcons, writeIcon, writeIconsIndex } from '~/generator/component-generator';
import { writeSyncSummary } from '~/summary/sync-summary';
import { svgToIconComponent } from '~/transformer/svgr-transformer';
import { REPO_ROOT } from '~/utils/file-system';
import { normalizeIconName } from '~/utils/icon-name';
import { log } from '~/utils/logger';

const {
    values: { type },
} = parseArgs({ options: { type: { type: 'string' } } });

if (!process.env.FIGMA_TOKEN) {
    log.error('FIGMA_TOKEN environment variable is not set.');
    process.exit(1);
}
if (!isIconType(type)) {
    log.error(`--type must be one of ${ICON_TYPE_NAMES.join(', ')}.`);
    process.exit(1);
}

const iconType = iconTypes[type];
const targetDir = path.join(REPO_ROOT, iconType.targetPath);
const colorFrames = colorFrameIds(iconType);

const nodes = await fetchIconNodes({
    fileKey: figma.fileKey,
    frameIds: iconType.frames.map((frame) => frame.id),
});
log.info(`${nodes.length} icons extraction complete`);

// Exit early if no icons found to prevent wiping the existing components.
if (nodes.length === 0) {
    log.error('No icons found! Check FIGMA_TOKEN and API access.');
    process.exit(1);
}

log.info('Loading svg files...');
const icons = await resolveSvgUrls({ nodes, fileKey: figma.fileKey });

log.info('Converting to React components...');
const limit = pLimit(10);
const results = await Promise.all(
    icons.map(({ name, url, parentId }) =>
        limit(async () => {
            const iconName = normalizeIconName(name);
            const component = await svgToIconComponent({
                svg: await downloadSvg(url),
                iconName,
                isColorIcon: colorFrames.has(parentId),
            });
            return { iconName, result: await writeIcon(targetDir, iconName, component) };
        }),
    ),
);
log.info('React component conversion complete!');

const iconNames = results.map(({ iconName }) => iconName);
const namesWith = (wanted: WriteResult) =>
    results.filter(({ result }) => result === wanted).map(({ iconName }) => iconName);
const created = namesWith('new');
const updated = namesWith('updated');

const deleted = await removeStaleIcons(targetDir, iconNames);
for (const name of deleted) log.warn(`🗑️  Deleted: ${name}`);

await writeIconsIndex(targetDir, iconNames);
log.info(`Sync complete for ${type} icons`);

// Handed to `write-release-notes` as a file: each icon type syncs in its own process.
await writeSyncSummary(type, { created, updated, deleted, total: iconNames.length });
