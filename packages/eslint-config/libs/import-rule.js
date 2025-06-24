import { ERROR, OFF } from './constants.js';

/** @type {Partial<import('eslint').Linter.RulesRecord>} */
export const rules = {
    'import/no-extraneous-dependencies': OFF, // 파일 확장자 관련 규칙
    'import/prefer-default-export': OFF, // default export 강제 규칙 비활성화
    'import/no-cycle': ERROR,
};
