/**
 * 원문 목록을 받아 번역을 돌려주는 포트.
 *
 * core는 이 타입만 알고, 누가 어떻게 번역하는지는 모른다. CI처럼 번역을 돌리면
 * 안 되는 환경에서는 구현을 아예 주입하지 않는 것으로 "번역 금지"를 표현한다.
 */
export type Translator = (sources: readonly string[]) => Promise<Map<string, string>>;
