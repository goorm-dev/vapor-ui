import { type SourceFile, SyntaxKind } from 'ts-morph';

import type { ExtendedType, FilePropsResult, Property, PropsInfo } from '~/types/props';

export function extractProps(sourceFile: SourceFile): FilePropsResult {
    const filePath = sourceFile.getFilePath();
    const props: PropsInfo[] = [];

    const namespaces = sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((mod) => mod.isExported());

    for (const ns of namespaces) {
        const nsName = ns.getName();
        const propsInterface = ns
            .getInterfaces()
            .find((i) => i.getName() === 'Props' && i.isExported());

        if (!propsInterface) continue;

        const localTypeAliases = new Map(
            ns.getTypeAliases().map((ta) => [ta.getName(), ta.getTypeNode()?.getText() ?? '']),
        );

        const extendsTypes: ExtendedType[] = propsInterface.getExtends().map((ext) => {
            const name = ext.getExpression().getText();
            const resolved = localTypeAliases.get(name) ?? name;
            return { name, resolved };
        });

        const properties: Property[] = propsInterface.getProperties().map((prop) => ({
            name: prop.getName(),
            type: prop.getTypeNode()?.getText() ?? 'unknown',
            optional: prop.hasQuestionToken(),
        }));

        const associatedTypes = ns
            .getTypeAliases()
            .filter((ta) => ta.isExported())
            .map((ta) => ta.getName());

        props.push({
            name: `${nsName}.Props`,
            extends: extendsTypes,
            properties,
            associatedTypes,
        });
    }

    return { filePath, props };
}
