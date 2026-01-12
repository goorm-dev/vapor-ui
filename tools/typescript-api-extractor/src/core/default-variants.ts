/**
 * defaultVariants 추출 모듈
 *
 * 같은 디렉토리의 .css.ts 파일에서 defaultVariants를 파싱합니다.
 * 예: button.css.ts의 defaultVariants: { colorPalette: 'primary', size: 'md' }
 */

import fs from 'node:fs';
import path from 'node:path';

export type DefaultVariants = Record<string, string>;

export function findCssFile(componentFilePath: string): string | null {
    const dir = path.dirname(componentFilePath);
    const baseName = path.basename(componentFilePath, path.extname(componentFilePath));

    // 정확한 케이스 매칭
    const exactPath = path.join(dir, `${baseName}.css.ts`);
    if (fs.existsSync(exactPath)) return exactPath;

    // 소문자 변환
    const lowerPath = path.join(dir, `${baseName.toLowerCase()}.css.ts`);
    if (fs.existsSync(lowerPath)) return lowerPath;

    return null;
}

export function parseDefaultVariants(cssFilePath: string): DefaultVariants {
    const content = fs.readFileSync(cssFilePath, 'utf-8');
    const result: DefaultVariants = {};

    // defaultVariants: { key: 'value', ... } 패턴 매칭
    const defaultVariantsRegex = /defaultVariants:\s*\{([^}]+)\}/g;

    let match;
    while ((match = defaultVariantsRegex.exec(content)) !== null) {
        const variantsContent = match[1];

        // key: 'value' 또는 key: "value" 패턴 파싱
        const pairRegex = /(\w+):\s*['"]([^'"]+)['"]/g;
        let pairMatch;
        while ((pairMatch = pairRegex.exec(variantsContent)) !== null) {
            const [, key, value] = pairMatch;
            // 첫 번째 정의만 사용
            if (!(key in result)) {
                result[key] = value;
            }
        }
    }

    return result;
}

export function getDefaultVariantsForComponent(componentFilePath: string): DefaultVariants {
    const cssFile = findCssFile(componentFilePath);
    if (!cssFile) return {};
    return parseDefaultVariants(cssFile);
}
