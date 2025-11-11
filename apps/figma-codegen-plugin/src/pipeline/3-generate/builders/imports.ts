/**
 * Import Statement Builder
 *
 * Import 문 생성
 */

import { VAPOR_UI_PACKAGE } from '../../../domain/constants';

/**
 * Import 문 생성
 *
 * @param imports - Import할 컴포넌트 이름 Set
 * @returns Import 문자열
 */
export function generateImports(imports: Set<string>): string {
    if (imports.size === 0) {
        return '';
    }

    // Set을 배열로 변환하고 정렬
    const sortedImports = Array.from(imports).sort();

    // 복합 컴포넌트 그룹화 (예: Breadcrumb, Breadcrumb.Item → Breadcrumb)
    const rootComponents = new Set<string>();
    sortedImports.forEach((name) => {
        const rootName = name.split('.')[0];
        rootComponents.add(rootName);
    });

    const importList = Array.from(rootComponents).sort().join(', ');

    return `import { ${importList} } from '${VAPOR_UI_PACKAGE}';`;
}
