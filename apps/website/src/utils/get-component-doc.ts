import fs from 'fs';
import { markdownTable } from 'markdown-table';
import path from 'path';

import { parseComponentName } from './component-path';

interface PropDef {
    name: string;
    type: string[] | string;
    required: boolean;
    description: string;
    defaultValue?: string | number | boolean | null;
}

interface VariantDef {
    name: string;
    type: string[];
    defaultValue?: string;
    required?: boolean;
    description?: string;
}

interface ComponentDoc {
    props: PropDef[];
    variants?: VariantDef[];
}

export const replaceComponentDoc = (text: string) => {
    return text.replace(
        /<ComponentPropsTable\s+componentName="([^"]+)"\s*\/>/g,
        (_, componentName: string) => {
            try {
                const { folder, filename } = parseComponentName(componentName);

                const jsonPath = path.join(
                    process.cwd(),
                    'public',
                    'references',
                    folder,
                    `${filename}.json`,
                );

                if (!fs.existsSync(jsonPath)) {
                    return `> ⚠️ Spec file not found: \`${componentName}.json\``;
                }

                const jsonRaw = fs.readFileSync(jsonPath, 'utf-8');
                const json: ComponentDoc = JSON.parse(jsonRaw);
                const props = json.props || [];
                const variants = json.variants || [];

                const hasProps = Array.isArray(props) && props.length > 0;
                const hasVariants = Array.isArray(variants) && variants.length > 0;

                if (!hasProps && !hasVariants) {
                    return `> ⚠️ Props not found in \`${componentName}.json\``;
                }

                const escapeContent = (value: string | number | boolean | null | undefined) => {
                    let str = String(value ?? '');

                    str = str.replace(/\|/g, '\\|');
                    str = str.replace(/</g, '&lt;');
                    str = str.replace(/>/g, '&gt;');
                    str = str.replace(/\n/g, '<br/>');

                    return str;
                };

                let result = '';

                if (hasProps) {
                    const propsTable = markdownTable([
                        ['Prop', 'Type', 'Default', 'Description'],
                        ...props.map((item) => {
                            const name = item.required
                                ? `**${escapeContent(item.name)}**`
                                : `\`${escapeContent(item.name)}\``;

                            let typeStr = '';
                            if (Array.isArray(item.type)) {
                                typeStr = item.type
                                    .map((t) => `\`${String(t).replace(/\|/g, '\\|')}\``)
                                    .join(', ');
                            } else {
                                typeStr = `\`${String(item.type).replace(/\|/g, '\\|')}\``;
                            }

                            const defaultVal =
                                item.defaultValue !== undefined && item.defaultValue !== null
                                    ? `\`${escapeContent(item.defaultValue)}\``
                                    : '-';

                            const description = escapeContent(item.description);

                            return [name, typeStr, defaultVal, description];
                        }),
                    ]);
                    result += `\n${propsTable}\n`;
                }

                if (hasVariants) {
                    const variantsTable = markdownTable([
                        ['Variant', 'Values', 'Default'],
                        ...variants.map((variant) => {
                            const name = `\`${escapeContent(variant.name)}\``;
                            const values = variant.type
                                .map((v) => `\`${escapeContent(v)}\``)
                                .join(', ');
                            const defaultVal = variant.defaultValue
                                ? `\`${escapeContent(variant.defaultValue)}\``
                                : '-';

                            return [name, values, defaultVal];
                        }),
                    ]);
                    result += `\n**Variants**\n\n${variantsTable}\n`;
                }

                return result;
            } catch (err) {
                return `> ⚠️ Error rendering props for \`${componentName}\`: ${(err as Error).message}`;
            }
        },
    );
};
