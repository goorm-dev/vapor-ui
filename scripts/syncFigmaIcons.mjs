import { camelCase, startCase } from 'lodash-es';
import fs, { constants } from 'node:fs/promise';
import path from 'node:path';
import process from 'node:process';
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

console.log('\x1b[33m---------------- GDS FIGMA EXPORT -----------------\x1b[0m');

try {
    const { nodeIds, targetPath } = ICON_TYPES[TYPE];
    let FILE_KEY = FIGMA_ICONS_FILE_KEY;

    // Get nodes (icons) set as COMPONENT in the file.
    let components = [];
    if (TYPE === 'basic' || 'symbol') {
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
        nameArr: components.map(({ name }) => startCase(camelCase(name)).replace(/ /g, '')),
    };
    console.log(
        `\x1b[33m GDS FIGMA EXPORT: \x1b[0m ${componentsInfo.total} icons extraction complete`,
    );

    // Separate the IDs of extracted icons with commas and get URLs of svg images at once.
    console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m Loading svg files...`);
    const componentsWithUrl = await getNodesWithUrl({
        nodes: components,
        fileKey: FILE_KEY,
    });
    console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m svg file loading complete!`);

    // Convert svg code to React components through image URLs and save locally.
    console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m Converting to React components...`);
    const parentIconPath = path.join(CURRENT_DIRECTORY, targetPath);
    const newIconNameArr = [];
    const updatedIconNameArr = [];
    const promiseCreateIcons = componentsWithUrl.map(async ({ name, url, parentId }) => {
        const iconName = startCase(camelCase(name)).replace(/ /g, '');
        const saveTargetPath = path.join(parentIconPath, iconName);
        const iconFilePath = path.resolve(saveTargetPath, `${iconName}.tsx`);

        const isNewIcon = !(await fs.access(saveTargetPath, constants.F_OK));
        const isColorIcon = parentId === decodeURIComponent(FIGMA_ICONS_SYMBOL_COLOR_NODE_ID);

        // Fetch icon JSX once
        const iconJsx = await getIconJsx({ url, isColorIcon });
        const IconComponent = getIconComponent(iconName, iconJsx);

        if (isNewIcon) {
            await fs.mkdir(saveTargetPath);
            newIconNameArr.push(iconName);
        } else {
            // Check if existing icon content will be updated
            const isIconFileAccessible = await fs.access(iconFilePath, constants.F_OK);
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
    console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m React component conversion complete!`);

    // // export to entry file
    console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m Exporting to entry file...`);
    const iconsIndex = getIconsIndex(componentsInfo.nameArr);
    await fs.writeFile(path.join(CURRENT_DIRECTORY, targetPath, 'index.ts'), iconsIndex, {
        encoding: 'utf8',
    });

    // Output results for workflow capture
    console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m Sync complete for ${TYPE} icons`);
    if (newIconNameArr.length > 0) {
        console.log(`FIGMA_SYNC_NEW_ICONS_${TYPE.toUpperCase()}=${newIconNameArr.join(',')}`);
    }
    if (updatedIconNameArr.length > 0) {
        console.log(
            `FIGMA_SYNC_UPDATED_ICONS_${TYPE.toUpperCase()}=${updatedIconNameArr.join(',')}`,
        );
    }
    console.log(`FIGMA_SYNC_TOTAL_${TYPE.toUpperCase()}=${componentsInfo.total}`);
} catch (err) {
    console.error('Unhandled rejection', err);
}
console.log('\x1b[33m---------------------------------------------------\x1b[0m');
