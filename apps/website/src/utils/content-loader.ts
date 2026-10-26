import { isWebsiteRootPath } from './paths';

/** `~content/docs/<rel>` 모듈 import — webpack 가 이 리터럴로 범위 결정 */
const loadFromDocs = (rel: string) => import(`~content/docs/${rel}`);

/** `~content/<rel>` 모듈 import — 절대 경로 `/content/<rest>` 핸들러 */
const loadFromContent = (rel: string) => import(`~content/${rel}`);

/**
 * 통합 로더. 절대 `/content/foo` 든 상대 `foo` 든 해결.
 * `~content/docs/` 리터럴은 이 파일에만 존재.
 */
export const loadContentModule = (file: string) =>
    isWebsiteRootPath(file) ? loadFromContent(file.slice('/content/'.length)) : loadFromDocs(file);
