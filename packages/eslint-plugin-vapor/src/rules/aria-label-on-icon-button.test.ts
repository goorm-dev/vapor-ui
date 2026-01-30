import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import { ariaLabelOnIconButtonRule } from './aria-label-on-icon-button';

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

describe('aria-label-on-icon-button-rule', () => {
    ruleTester.run('aria-label-on-icon-button', ariaLabelOnIconButtonRule, {
        valid: [
            // 1. 기본 사용 (성공)
            {
                code: `import { IconButton } from '@vapor-ui/core'; <IconButton aria-label="닫기" />;`,
            },
            // 2. Alias 사용 (성공)
            {
                code: `import { IconButton as MyButton } from '@vapor-ui/core'; <MyButton aria-label="메뉴" />;`,
            },
            // 3. 서브 경로 및 Default Import
            {
                code: `import IconButton from '@vapor-ui/core/icon-button'; <IconButton aria-label="검색" />;`,
            },
            // 4. 상관없는 컴포넌트 (무시)
            {
                code: `import { Button } from '@vapor-ui/core'; <Button />;`,
            },
        ],
        invalid: [
            // 1. aria-label 누락
            {
                code: `import { IconButton } from '@vapor-ui/core'; <IconButton />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 2. Alias 사용 중 누락
            {
                code: `import { IconButton as MyButton } from '@vapor-ui/core'; <MyButton />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 3. 서브 경로 사용 중 누락
            {
                code: `import MyBtn from '@vapor-ui/core/icon-button'; <MyBtn />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
        ],
    });
});
