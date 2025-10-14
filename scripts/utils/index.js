import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

/**
 * Gets the names of all files in a folder and returns an array.
 */
const getFilesInFolder = (folderPath) => {
    const files = [];

    const traverseFolder = (currentPath) => {
        const entries = fs.readdir(currentPath, { withFileTypes: true });
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
 * Gets the names of all folders in a folder and returns an array.
 * @example getSubfolders('packages/icons/src') // ['basic', 'extension', ...]
 */
const getSubfolders = async (parentFolder) => {
    try {
        const subfolders = await fsp.readdir(parentFolder);

        return subfolders.filter((folder) => {
            const folderPath = path.join(parentFolder, folder);
            return fsp.stat(folderPath).isDirectory();
        });
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
};

export { getFilesInFolder, getSubfolders };
