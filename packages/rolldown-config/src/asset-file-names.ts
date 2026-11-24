import path from 'node:path';
import type { PreRenderedAsset } from 'rolldown';

/**
 * 플러그인이 내보낸 CSS 에셋을 원본 소스 위치에 둔다 (`src/` 접두 제거).
 * e.g., 'src/components/button/button.css.ts.vanilla.css' -> 'components/button/button.css.ts.vanilla.css'
 *
 * Vanilla Extract·style-macro 플러그인은 에셋의 `originalFileName` 에 소스 경로(절대 경로
 * 또는 패키지 루트 기준 상대 경로)를 넘기고, 실제 출력 위치는 이 함수가 정한다.
 * 패키지 디렉터리에서 빌드한다고 가정한다 (`src` 는 `process.cwd()` 기준).
 */
export const assetFileNames = (assetInfo: PreRenderedAsset): string => {
    const original = assetInfo.originalFileNames.at(0);

    if (original && path.isAbsolute(original)) {
        const rel = path.relative(path.resolve('src'), original);

        if (rel && !rel.startsWith('..')) {
            return rel.split(path.sep).join('/');
        }
    }

    const name = original ?? assetInfo.names.at(0);
    if (!name) return 'assets/[name]-[hash][extname]';
    return name.replace(/^src\//, '');
};
