import fs from 'fs';
import path from 'path';

// Directory path to process
const directoryPath = 'stories/foundation/icons/';

try {
    // Read all files in the directory
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);

        // Check if it's a file (exclude directories)
        if (fs.statSync(filePath).isFile() && filePath.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Regular expression to find and remove duplicate import statements
            const regex =
                /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm;
            const imports = new Map();

            // Remove duplicate imports
            content = content.replace(
                regex,
                (match, importName, importPath) => {
                    if (imports.has(importName)) {
                        return ''; // Remove duplicate import
                    }
                    imports.set(importName, importPath);
                    return match;
                },
            );

            // Compress consecutive empty lines into one
            content = content.replace(/(\r?\n){2,}/g, '\n\n');

            // Overwrite file
            fs.writeFileSync(filePath, content, 'utf8');

            console.log(`Processed: ${filePath}`);
        }
    });

    console.log('All duplicate imports removed and empty lines cleaned.');
} catch (err) {
    console.error('Error processing files:', err);
}
