/**
 * Sync icons from Figma to local React components
 *
 * Usage:
 *   tsx --env-file=.env ./commands/sync-icons.ts
 *
 * Environment variables required:
 *   - FIGMA_TOKEN: Your Figma personal access token
 *   - TYPE: Icon type to sync ('basic' or 'symbol')
 *
 */
import { camelCase, startCase } from 'lodash-es';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import fs, { constants } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import pLimit from 'p-limit';
import pc from 'picocolors';
import prettier from 'prettier';

import {
    FIGMA_ICONS_FILE_KEY,
    FIGMA_ICONS_SYMBOL_COLOR_COUNTRY_NODE_ID,
    FIGMA_ICONS_SYMBOL_COLOR_NODE_ID,
    FIGMA_NODE_TYPES,
} from '~/icons/constants';
import { ICON_TYPES } from '~/icons/icon-types';
import getIconComponentIndex from '~/icons/templates/icon/icon-component-index';
import getIconComponent from '~/icons/templates/icon/icon-component';
import getIconsIndex from '~/icons/templates/icon/icons-index';
import type { IconNode } from '~/integrations/figma/lib';
import {
    filterDocumentByNodeType,
    getIconJsx,
    getNodesWithUrl,
} from '~/integrations/figma/lib';

const TYPE = process.env.TYPE;

function findRoot(dir: string): string {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir)
        throw new Error('Could not find project root (pnpm-workspace.yaml not found)');
    return findRoot(parent);
}
const CURRENT_DIRECTORY = findRoot(path.dirname(fileURLToPath(import.meta.url)));
const FIGMA_EMOJI_PREFIX_PATTERN = /❤️\s*/g;
const PRETTIER_OPTIONS = {
    parser: 'typescript',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    printWidth: 100,
};

function normalizeIconName(name: string) {
    return startCase(camelCase(name.replace(FIGMA_EMOJI_PREFIX_PATTERN, ''))).replace(/ /g, '');
}

console.log(pc.yellow('---------------- GDS FIGMA EXPORT -----------------'));

if (!process.env.FIGMA_TOKEN) {
    console.error(pc.red(' GDS FIGMA EXPORT ERROR: FIGMA_TOKEN environment variable is not set.'));
    process.exit(1);
}

if (!TYPE || !(TYPE in ICON_TYPES)) {
    console.error(
        pc.red(
            ` GDS FIGMA EXPORT ERROR: TYPE must be one of ${Object.keys(ICON_TYPES).join(', ')}.`,
        ),
    );
    process.exit(1);
}

try {
    const { nodeIds, targetPath } = ICON_TYPES[TYPE];
    const FILE_KEY = FIGMA_ICONS_FILE_KEY;

    // Get nodes (icons) set as COMPONENT in the file.
    // Each icon type spans several frames, so nodeIds are fetched one frame at a time.
    let components: IconNode[] = [];
    for (const nodeId of nodeIds) {
        const nodeComponents = await filterDocumentByNodeType({
            nodeType: FIGMA_NODE_TYPES.Component,
            fileKey: FILE_KEY,
            nodeIds: nodeId,
            depth: 1,
        });
        components = components.concat(nodeComponents);
    }

    const componentsInfo = {
        total: components.length,
        nameArr: components.map(({ name }) => normalizeIconName(name)),
    };
    console.log(
        pc.yellow(` GDS FIGMA EXPORT: `) + `${componentsInfo.total} icons extraction complete`,
    );

    // Exit early if no icons found to prevent overwriting existing files
    if (components.length === 0) {
        console.error(
            pc.red(' GDS FIGMA EXPORT ERROR: No icons found! Check FIGMA_TOKEN and API access.'),
        );
        process.exit(1);
    }

    // Separate the IDs of extracted icons with commas and get URLs of svg images at once.
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `Loading svg files...`);
    const componentsWithUrl = await getNodesWithUrl({
        nodes: components,
        fileKey: FILE_KEY,
    });
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `svg file loading complete!`);

    // Convert svg code to React components through image URLs and save locally.
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `Converting to React components...`);
    const parentIconPath = path.join(CURRENT_DIRECTORY, targetPath);
    const newIconNameArr: string[] = [];
    const updatedIconNameArr: string[] = [];
    const limit = pLimit(10);
    const md5 = (str: string) => createHash('md5').update(str).digest('hex');

    const promiseCreateIcons = componentsWithUrl.map(({ name, url, parentId }) =>
        limit(async () => {
            const iconName = normalizeIconName(name);
            const saveTargetPath = path.join(parentIconPath, iconName);
            const iconFilePath = path.resolve(saveTargetPath, `${iconName}.tsx`);

            let isNewIcon = false;
            try {
                await fs.access(saveTargetPath, constants.F_OK);
                isNewIcon = false;
            } catch {
                isNewIcon = true;
            }
            const isColorIcon =
                parentId === decodeURIComponent(FIGMA_ICONS_SYMBOL_COLOR_NODE_ID) ||
                parentId === decodeURIComponent(FIGMA_ICONS_SYMBOL_COLOR_COUNTRY_NODE_ID);

            const iconJsx = await getIconJsx({ url, isColorIcon });
            const IconComponent = getIconComponent(iconName, iconJsx);
            const formattedComponent = await prettier.format(IconComponent, PRETTIER_OPTIONS);

            let shouldWrite = isNewIcon;

            if (isNewIcon) {
                await fs.mkdir(saveTargetPath, { recursive: true });
                newIconNameArr.push(iconName);
            } else {
                let existingContent: string | null = null;
                try {
                    existingContent = await fs.readFile(iconFilePath, 'utf8');
                } catch {
                    shouldWrite = true;
                }

                if (existingContent !== null && md5(existingContent) !== md5(formattedComponent)) {
                    updatedIconNameArr.push(iconName);
                    shouldWrite = true;
                }
            }

            if (shouldWrite) {
                const iconIndex = getIconComponentIndex(iconName);
                const formattedIndex = await prettier.format(iconIndex, PRETTIER_OPTIONS);

                await Promise.all([
                    fs.writeFile(iconFilePath, formattedComponent, { encoding: 'utf8' }),
                    fs.writeFile(path.resolve(saveTargetPath, `index.ts`), formattedIndex, {
                        encoding: 'utf8',
                    }),
                ]);
            }
        }),
    );
    await Promise.all(promiseCreateIcons);
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `React component conversion complete!`);

    // Detect and remove deleted icons
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `Checking for deleted icons...`);
    const deletedIconNameArr: string[] = [];
    const figmaIconNames = new Set(componentsInfo.nameArr);

    // Get existing icon directories
    const existingIconNames = (await fs.readdir(parentIconPath, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    // Find icons that exist locally but not in Figma
    const iconsToDelete = existingIconNames.filter((iconName) => !figmaIconNames.has(iconName));

    // Delete removed icons
    if (iconsToDelete.length > 0) {
        const promiseDeleteIcons = iconsToDelete.map(async (iconName) => {
            const deleteTargetPath = path.join(parentIconPath, iconName);
            await fs.rm(deleteTargetPath, { recursive: true, force: true });
            deletedIconNameArr.push(iconName);
            console.log(pc.red(` GDS FIGMA EXPORT: 🗑️  Deleted: ${iconName}`));
        });

        await Promise.all(promiseDeleteIcons);
        console.log(
            pc.yellow(` GDS FIGMA EXPORT: `) + `Removed ${deletedIconNameArr.length} deleted icons`,
        );
    } else {
        console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `No deleted icons found`);
    }

    // // export to entry file
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `Exporting to entry file...`);
    const iconsIndex = getIconsIndex(componentsInfo.nameArr);
    const formattedIconsIndex = await prettier.format(iconsIndex, PRETTIER_OPTIONS);
    await fs.writeFile(path.join(CURRENT_DIRECTORY, targetPath, 'index.ts'), formattedIconsIndex, {
        encoding: 'utf8',
    });

    // Output results for workflow capture
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `Sync complete for ${TYPE} icons`);
    if (newIconNameArr.length > 0) {
        console.log(`FIGMA_SYNC_NEW_ICONS_${TYPE.toUpperCase()}=${newIconNameArr.join(',')}`);
    }
    if (updatedIconNameArr.length > 0) {
        console.log(
            `FIGMA_SYNC_UPDATED_ICONS_${TYPE.toUpperCase()}=${updatedIconNameArr.join(',')}`,
        );
    }
    if (deletedIconNameArr.length > 0) {
        console.log(
            `FIGMA_SYNC_DELETED_ICONS_${TYPE.toUpperCase()}=${deletedIconNameArr.join(',')}`,
        );
    }
    console.log(`FIGMA_SYNC_TOTAL_${TYPE.toUpperCase()}=${componentsInfo.total}`);
} catch (err) {
    console.error('Unhandled rejection', err);
    process.exit(1);
}
console.log(pc.yellow('---------------------------------------------------'));
