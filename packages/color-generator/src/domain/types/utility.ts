/**
 * 객체의 모든 깊이(Deep)에 있는 프로퍼티를 필수(Required)로 만듭니다.
 * 
 * * @warning
 * 이 타입은 **순수 데이터 객체(POJO)**에 최적화되어 있습니다.
 * `Date`, `Map`, `Set`, `Class` 인스턴스 등이 포함된 복잡한 객체에 사용할 경우
 * 내부 메서드 타입까지 강제로 변경될 수 있으니 주의하세요.
 *
 * @example
 * interface Theme {
 * color?: { primary?: string };
 * }
 * * // Result: { color: { primary: string } }
 * type StrictTheme = DeepRequired<Theme>;
 */
export type DeepRequired<T> = T extends object
    ? {
          [K in keyof T]-?: DeepRequired<T[K]>;
      }
    : T;
