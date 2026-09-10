/**
 * Regenerate the Figma Code Connect mapping for `@vapor-ui/icons`.
 *
 * `cli.ts` already writes this mapping on every sync — use this entry when you only want to
 * refresh the node ids, without re-downloading and re-generating all 800+ components.
 *
 * Usage:
 *   tsx --env-file=.env ./src/code-connect.ts
 *
 * Requires FIGMA_TOKEN.
 */
import process from 'node:process';

import { ICON_TYPE_NAMES, figma, iconTypes } from '~/config';
import { fetchIconNodes } from '~/downloader/svg-downloader';
import { writeCodeConnectBatch } from '~/generator/code-connect-generator';
import { log } from '~/utils/logger';

if (!process.env.FIGMA_TOKEN) {
    log.error('FIGMA_TOKEN environment variable is not set.');
    process.exit(1);
}

for (const type of ICON_TYPE_NAMES) {
    const iconType = iconTypes[type];
    const nodes = await fetchIconNodes({
        fileKey: figma.fileKey,
        frameIds: iconType.frames.map((frame) => frame.id),
    });

    // Writing an empty mapping would unpublish every icon on the next publish.
    if (nodes.length === 0) {
        log.error(`No ${type} icons found! Check FIGMA_TOKEN and API access.`);
        process.exit(1);
    }

    const outFile = await writeCodeConnectBatch(type, iconType, nodes);
    log.info(`${nodes.length} ${type} icons → ${outFile}`);
}
