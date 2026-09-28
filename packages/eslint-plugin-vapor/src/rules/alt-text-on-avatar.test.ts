import { RuleTester } from 'eslint';

import { altTextOnAvatarRule } from './alt-text-on-avatar';

// NOTE: ruleTester.run must be called at the top level, NOT inside it().
// With vitest `globals: true`, RuleTester registers each case via the global
// describe/it — nesting that inside a running it() silently skips every case.
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

ruleTester.run('alt-text-on-avatar', altTextOnAvatarRule, {
    valid: [
        // 1. src 없으면 alt 없어도 됨
        {
            code: `import { Avatar } from '@vapor-ui/core'; <Avatar.Root />;`,
        },
        // 2. src 있으면 alt 필수
        {
            code: `import { Avatar } from '@vapor-ui/core'; <Avatar.Root src="image.jpg" alt="User Avatar" />;`,
        },
        // 3. Alias 사용 시
        {
            code: `import { Avatar as MyAvatar } from '@vapor-ui/core'; <MyAvatar.Root src="image.jpg" alt="User Avatar" />;`,
        },
        // 4. Namespace import 사용 시
        {
            code: `import * as Vapor from '@vapor-ui/core'; <Vapor.Avatar.Root src="image.jpg" alt="User Avatar" />;`,
        },
        // 5. Namespace import & src 없음
        {
            code: `import * as Vapor from '@vapor-ui/core'; <Vapor.Avatar.Root />;`,
        },
        // 6. Deep import
        {
            code: `import { Avatar } from '@vapor-ui/core/avatar'; <Avatar.Root src="image.jpg" alt="User Avatar" />;`,
        },
        // 7. 자식 요소가 있어도 src가 없으면 통과
        {
            code: `
                import { Avatar } from '@vapor-ui/core';
                <Avatar.Root>
                    <Avatar.ImagePrimitive />
                    <Avatar.FallbackPrimitive />
                </Avatar.Root>
            `,
        },
        // 8. src만 없으면 다른 속성(alt) 있어도 통과
        {
            code: `
                import { Avatar } from '@vapor-ui/core';
                <Avatar.Root alt="User Avatar">
                    <Avatar.ImagePrimitive />
                    <Avatar.FallbackPrimitive />
                </Avatar.Root>
            `,
        },
    ],
    invalid: [
        // 1. src 있는데 alt 없음
        {
            code: `import { Avatar } from '@vapor-ui/core'; <Avatar.Root src="image.jpg" />;`,
            errors: [{ messageId: 'missingAlt' }],
        },
        // 2. Alias & src 있음 & alt 없음
        {
            code: `import { Avatar as MyAvatar } from '@vapor-ui/core'; <MyAvatar.Root src="image.jpg" />;`,
            errors: [{ messageId: 'missingAlt' }],
        },
        // 3. Namespace & src 있음 & alt 없음
        {
            code: `import * as Vapor from '@vapor-ui/core'; <Vapor.Avatar.Root src="image.jpg" />;`,
            errors: [{ messageId: 'missingAlt' }],
        },
        // 4. Deep import & src 있음 & alt 없음
        {
            code: `import { Avatar } from '@vapor-ui/core/avatar'; <Avatar.Root src="image.jpg" />;`,
            errors: [{ messageId: 'missingAlt' }],
        },
        // 5. Children 있어도 src 있으면 alt 필수
        {
            code: `
                import { Avatar } from '@vapor-ui/core/avatar';
                <Avatar.Root src="image.jpg">
                    <Avatar.ImagePrimitive />
                    <Avatar.FallbackPrimitive />
                </Avatar.Root>;
            `,
            errors: [{ messageId: 'missingAlt' }],
        },
    ],
});
