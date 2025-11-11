/**
 * Metadata Infrastructure
 *
 * 메타데이터 관련 모듈 export
 *
 * PRD 9: 직접 import 방식
 * metadata는 component.metadata.ts에서 직접 import하여 사용
 */

export * from './types';
export * from './loader'; // Deprecated, for backward compatibility
export * from './validator';
export { metadata, getComponentRule } from './component.metadata';
