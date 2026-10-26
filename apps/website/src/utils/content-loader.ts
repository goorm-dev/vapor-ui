/** `<Demo file>` 모듈 import — webpack 가 `~content/docs/` 리터럴로 범위 결정, 이 파일에만 존재. */
export const loadContentModule = (file: string) => import(`~content/docs/${file}`);
