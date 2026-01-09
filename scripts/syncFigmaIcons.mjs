/**
 * Sync icons from Figma to local React components
 *
 * Usage:
 *   node --env-file=.env --experimental-fetch ./scripts/syncFigmaIcons.mjs
 *
 * Environment variables required:
 *   - FIGMA_TOKEN: Your Figma personal access token
 *   - TYPE: Icon type to sync ('basic' or 'symbol')
 *
 * Note: Node.js 20.6+ required for --env-file flag
 */
import { camelCase, startCase } from 'lodash-es';
import fs, { constants } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pc from 'picocolors';
import prettier from 'prettier';

import {
    FIGMA_ICONS_FILE_KEY,
    FIGMA_ICONS_SYMBOL_COLOR_NODE_ID,
    FIGMA_NODE_TYPES,
} from './constants/figma.js';
import { ICON_TYPES } from './constants/index.js';
import { filterDocumentByNodeType, getIconJsx, getNodesWithUrl } from './libs/figma.js';
import getIconComponent from './templates/icon/IconComponent.js';
import getIconComponentIndex from './templates/icon/iconComponentIndex.js';
import getIconsIndex from './templates/icon/iconsIndex.js';

const TYPE = process.env.TYPE;
const CURRENT_DIRECTORY = process.cwd();
const FIGMA_EMOJI_PREFIX_PATTERN = /❤️\s*/g;

function normalizeIconName(name) {
    return startCase(camelCase(name.replace(FIGMA_EMOJI_PREFIX_PATTERN, ''))).replace(/ /g, '');
}

console.log(pc.yellow('---------------- GDS FIGMA EXPORT -----------------'));

if (!process.env.FIGMA_TOKEN) {
    console.error(
        pc.red(' GDS FIGMA EXPORT ERROR: FIGMA_TOKEN environment variable is not set.'),
    );
    process.exit(1);
}

try {
    const { nodeIds, targetPath } = ICON_TYPES[TYPE];
    let FILE_KEY = FIGMA_ICONS_FILE_KEY;

    // Get nodes (icons) set as COMPONENT in the file.
    let components = [];
    if (TYPE === 'basic' || TYPE === 'symbol') {
        FILE_KEY = FIGMA_ICONS_FILE_KEY;
        // Basic icons are composed of 2 frames, so nodeIds are in array form
        for (const nodeId of nodeIds) {
            const nodeComponents = await filterDocumentByNodeType({
                nodeType: FIGMA_NODE_TYPES.Component,
                fileKey: FILE_KEY,
                nodeIds: nodeId,
                depth: 1,
            });
            components = components.concat(nodeComponents);
        }
    } else {
        components = await filterDocumentByNodeType({
            nodeType: FIGMA_NODE_TYPES.Component,
            fileKey: FILE_KEY,
            nodeIds,
            depth: 1,
        });
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
    const newIconNameArr = [];
    const updatedIconNameArr = [];
    const promiseCreateIcons = componentsWithUrl.map(async ({ name, url, parentId }) => {
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
        const isColorIcon = parentId === decodeURIComponent(FIGMA_ICONS_SYMBOL_COLOR_NODE_ID);

        // Fetch icon JSX once
        const iconJsx = await getIconJsx({ url, isColorIcon });
        const IconComponent = getIconComponent(iconName, iconJsx);

        if (isNewIcon) {
            await fs.mkdir(saveTargetPath);
            newIconNameArr.push(iconName);
        } else {
            let isIconFileAccessible = false;
            try {
                await fs.access(iconFilePath, constants.F_OK);
                isIconFileAccessible = true;
            } catch {
                isIconFileAccessible = false;
            }

            if (isIconFileAccessible) {
                const existingContent = await fs.readFile(iconFilePath, 'utf8');

                // Format both existing and new content for accurate comparison
                const formattedNew = await prettier.format(IconComponent, {
                    parser: 'typescript',
                    tabWidth: 4,
                    semi: true,
                    singleQuote: true,
                    printWidth: 100,
                });
                const formattedExisting = await prettier.format(existingContent, {
                    parser: 'typescript',
                    tabWidth: 4,
                    semi: true,
                    singleQuote: true,
                    printWidth: 100,
                });

                if (formattedExisting !== formattedNew) {
                    updatedIconNameArr.push(iconName);
                }
            }
        }

        const iconIndex = getIconComponentIndex(iconName);

        const writeIconComponent = fs.writeFile(iconFilePath, IconComponent, { encoding: 'utf8' });
        const writeIconIndex = fs.writeFile(path.resolve(saveTargetPath, `index.ts`), iconIndex, {
            encoding: 'utf8',
        });

        await Promise.all([writeIconComponent, writeIconIndex]);
    });
    await Promise.all(promiseCreateIcons);
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `React component conversion complete!`);

    // Detect and remove deleted icons
    console.log(pc.yellow(` GDS FIGMA EXPORT: `) + `Checking for deleted icons...`);
    const deletedIconNameArr = [];
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
    await fs.writeFile(path.join(CURRENT_DIRECTORY, targetPath, 'index.ts'), iconsIndex, {
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
}
console.log(pc.yellow('---------------------------------------------------'));
