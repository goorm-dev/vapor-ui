import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

/**
 * 폴더 내의 모든 파일들의 이름들을 가져와 배열을 반환한다.
 */
const getFilesInFolder = (folderPath) => {
    const files = [];

    const traverseFolder = (currentPath) => {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        entries.forEach((entry) => {
            const fullPath = path.join(currentPath, entry.name);

            if (entry.isFile()) {
                const fileName = path.basename(fullPath);
                files.push(fileName);
            }
        });
    };

    traverseFolder(folderPath);
    return files;
};

/**
 * 폴더 내의 모든 폴더들의 이름들을 가져와 배열을 반환한다.
 * @example getSubfolders('packages/icons/src') // ['basic', 'extension', ...]
 */
const getSubfolders = async (parentFolder) => {
    try {
        const subfolders = await promisify(fs.readdir)(parentFolder);

        return subfolders.filter((folder) => {
            const folderPath = path.join(parentFolder, folder);
            return fs.statSync(folderPath).isDirectory();
        });
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
};

export {
    writeFile,
    getFilesInFolder,
    getSubfolders,
};
