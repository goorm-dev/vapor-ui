import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { CONTENT_PATH, isAbsolutePath } from '~/utils/paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type DocGenFile = {
    file: string;
    codeblock?: boolean;
};

/**
 * Replace `<Demo file="..." />` with a `doc-gen:file` block, so {@link replaceBlockDoc} can
 * inline the file contents for LLM consumers. Mirrors the MDX-build-time behaviour of
 * `remark-demo-source` without running the remark pipeline here: a relative `file` is
 * resolved from `content/docs`, an absolute one from `apps/website`.
 */
export const replaceDemoSelfClosing = (text: string): string =>
    text.replace(/<Demo\s+file=(["'])([^"']+)\1[^>]*\/>/g, (_, _quote: string, file: string) => {
        const resolved = isAbsolutePath(file) ? file : `/${CONTENT_PATH}/${file}`;
        const config = JSON.stringify({ file: resolved, codeblock: true }, null, 4);
        return `\`\`\`json doc-gen:file\n${config}\n\`\`\``;
    });

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
