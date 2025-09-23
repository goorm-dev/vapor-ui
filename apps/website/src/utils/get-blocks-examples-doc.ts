import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type DocGenFile = {
    file: string;
    codeblock?: boolean;
};

/**
 * Replace ```json doc-gen:file tags inside blocks MDX content
 * with actual file contents, so LLM can parse blocks source code.
 *
 * @param text MDX source string
 * @returns string with doc-gen:file tags replaced by actual file contents
 */
export const replaceBlockDoc = (text: string) => {
    const result = text.replace(
        /```json doc-gen:file\n([\s\S]*?)\n```/g,
        (_, jsonContent: string) => {
            try {
                const config: DocGenFile = JSON.parse(jsonContent.trim());
                // Remove leading ./ from the file path and resolve from apps/website
                const normalizedFile = config.file.replace(/^\.\//, '');
                console.log(__dirname, normalizedFile);
                const filePath = path.join(path.resolve(__dirname, '../..'), normalizedFile);

                if (!fs.existsSync(filePath)) {
                    return `> ⚠️ File not found: \`${config.file}\` (resolved to: ${filePath})`;
                }

                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const fileExtension = path.extname(config.file).substring(1);

                // Return as a code block with proper syntax highlighting
                return `\`\`\`${fileExtension}\n${fileContent}\n\`\`\``;
            } catch (err) {
                return `> ⚠️ Error parsing doc-gen:file config: ${(err as Error).message}`;
            }
        },
    );

    return result;
};
