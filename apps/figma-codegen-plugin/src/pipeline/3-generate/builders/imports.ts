/**
 * Import Statement Builder
 *
 * Import 문 생성
 */
import { VAPOR_UI_ICONS_PACKAGE, VAPOR_UI_PACKAGE } from '../../../domain/constants';

/**
 * Import 문 생성
 *
 * @param imports - Import할 컴포넌트 이름 Set
 * @param iconImports - Import할 아이콘 이름 Set
 * @returns Import 문자열
 */
export function generateImports(imports: Set<string>, iconImports?: Set<string>): string {
    const importStatements: string[] = [];

    // 일반 컴포넌트 import
    if (imports.size > 0) {
        // Set을 배열로 변환하고 정렬
        const sortedImports = Array.from(imports).sort();

        // 복합 컴포넌트 그룹화 (예: Breadcrumb, Breadcrumb.Item → Breadcrumb)
        const rootComponents = new Set<string>();
        sortedImports.forEach((name) => {
            const rootName = name.split('.')[0];
            rootComponents.add(rootName);
        });

        const importList = Array.from(rootComponents).sort().join(', ');
        importStatements.push(`import { ${importList} } from '${VAPOR_UI_PACKAGE}';`);
    }

    // 아이콘 import
    if (iconImports && iconImports.size > 0) {
        const sortedIconImports = Array.from(iconImports).sort().join(', ');
        importStatements.push(`import { ${sortedIconImports} } from '${VAPOR_UI_ICONS_PACKAGE}';`);
    }

    return importStatements.join('\n');
}
