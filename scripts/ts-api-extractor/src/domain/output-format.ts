import { toKebabCase } from '~/domain/file-name';
import type { PropsInfoJson } from '~/domain/output';

/**
 * How one extracted component becomes one file on disk. Adding a format means
 * adding an entry here and selecting it — the writer stays untouched.
 */
export interface OutputFormat {
    name: string;
    extension: string;
    serialize(data: PropsInfoJson): string;
}

/**
 * 추출과 번역이 공유하는 유일한 직렬화 정의.
 *
 * 산출물은 커밋되고 CI가 재생성 결과와 대조하므로 포맷이 흔들리면 전 파일이
 * diff로 뜬다. prettier에 맡기지 않는 이유가 이것이다 — `.prettierignore`가
 * `public`을 무시해 실제 출력 경로에서는 적용되지 않고, 다른 경로에서는
 * 리포 설정을 못 찾아 기본값으로 포맷한다.
 */
export const jsonOutputFormat: OutputFormat = {
    name: 'json',
    extension: '.json',
    serialize: (data) => JSON.stringify(data, null, 4) + '\n',
};

export function formatFileName(componentName: string, format: OutputFormat): string {
    return `${toKebabCase(componentName)}${format.extension}`;
}
