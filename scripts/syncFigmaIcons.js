import fs from 'fs';
import { camelCase, startCase } from 'lodash-es';
import path from 'path';
import { promisify } from 'util';

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

const writeFile = promisify(fs.writeFile);

const TYPE = process.env.TYPE;
const CURRENT_DIRECTORY = process.cwd();

const main = async () => {
    console.log('\x1b[33m---------------- GDS FIGMA EXPORT -----------------\x1b[0m');

    try {
        const { nodeIds, targetPath } = ICON_TYPES[TYPE];
        let FILE_KEY = FIGMA_ICONS_FILE_KEY;

        // Get nodes (icons) set as COMPONENT in the file.
        let components = [];
        if (TYPE === 'basic') {
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
        const promiseCreateIcons = componentsWithUrl.map(async ({ name, url, parentId }) => {
            const iconName = startCase(camelCase(name)).replace(/ /g, '');
            const saveTargetPath = path.join(parentIconPath, iconName);

            if (!fs.existsSync(saveTargetPath)) {
                fs.mkdirSync(saveTargetPath);
                newIconNameArr.push(iconName);
            }

            const isColorIcon = parentId === decodeURIComponent(FIGMA_ICONS_SYMBOL_COLOR_NODE_ID);

            const iconJsx = await getIconJsx({ url, isColorIcon });
            const IconComponent = getIconComponent(iconName, iconJsx);
            const iconIndex = getIconComponentIndex(iconName);

            const writeIconComponent = writeFile(
                path.resolve(saveTargetPath, `${iconName}.tsx`),
                IconComponent,
                { encoding: 'utf8' },
            );
            const writeIconIndex = writeFile(path.resolve(saveTargetPath, `index.ts`), iconIndex, {
                encoding: 'utf8',
            });

            await Promise.all([writeIconComponent, writeIconIndex]);
        });
        await Promise.all(promiseCreateIcons);
        console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m React component conversion complete!`);

        // // export to entry file
        console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m Exporting to entry file...`);
        const iconsIndex = getIconsIndex(componentsInfo.nameArr);
        await writeFile(path.join(CURRENT_DIRECTORY, targetPath, 'index.ts'), iconsIndex, {
            encoding: 'utf8',
        });
    } catch (err) {
        console.error('Unhandled rejection', err);
    }
    console.log('\x1b[33m---------------------------------------------------\x1b[0m');
};

main();
