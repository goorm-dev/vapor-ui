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

        // 파일 내에 COMPONENT로 설정된 node(아이콘)들을 가져온다.
        let components = [];
        if (TYPE === 'basic') {
            FILE_KEY = FIGMA_ICONS_FILE_KEY;
            // basic 아이콘은 2개의 프레임으로 구성되어 있어서 nodeIds가 배열 형태임
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
            `\x1b[33m GDS FIGMA EXPORT: \x1b[0m ${componentsInfo.total}개 아이콘 추출 완료`,
        );

        // 추출된 아이콘들의 id를 콤마로 구분하여, 한번에 svg 이미지들의 URL를 가져온다.
        console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m svg 파일 불러오는 중...`);
        const componentsWithUrl = await getNodesWithUrl({
            nodes: components,
            fileKey: FILE_KEY,
        });
        console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m svg 파일 불러오기 완료 !`);

        // 이미지 URL을 통해 svg 코드를 React 컴포넌트로 변환 후, 로컬에 저장한다.
        console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m React 컴포넌트로 변환 중...`);
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
        console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m React 컴포넌트로 변환 완료 !`);

        // // entry 파일에 export
        console.log(`\x1b[33m GDS FIGMA EXPORT: \x1b[0m entry 파일에 export 중...`);
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
