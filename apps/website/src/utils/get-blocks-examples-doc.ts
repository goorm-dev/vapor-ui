import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { toWebsitePath } from '~/utils/paths';

const WEBSITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Replace `<Demo file="..." />` with a code block of the demo's source, so LLM consumers get the
 * code. Mirrors the MDX-build-time behaviour of `remark-demo-source` without running the remark
 * pipeline here.
 */
export const replaceDemoSelfClosing = (text: string): string =>
    text.replace(/<Demo\s+file=(["'])([^"']+)\1[^>]*\/>/g, (_, _quote: string, file: string) => {
        const filePath = path.join(WEBSITE_ROOT, toWebsitePath(file));

        if (!fs.existsSync(filePath)) {
            return `> ⚠️ File not found: \`${file}\` (resolved to: ${filePath})`;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const fileExtension = path.extname(file).substring(1);

        return `\`\`\`${fileExtension}\n${fileContent}\n\`\`\``;
    });
