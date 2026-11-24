import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import { ariaLabelOnNavigationRule } from './aria-label-on-navigation';

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

describe('aria-label-on-navigation-rule', () => {
    ruleTester.run('aria-label-on-navigation', ariaLabelOnNavigationRule, {
        valid: [
            // 1. NavigationMenu.Root (성공)
            {
                code: `import { NavigationMenu } from '@vapor-ui/core'; <NavigationMenu.Root aria-label="메인" />;`,
            },
            // 2. Breadcrumb.Root (성공)
            {
                code: `import { Breadcrumb } from '@vapor-ui/core/breadcrumb'; <Breadcrumb.Root aria-label="경로" />;`,
            },
            // 3. Namespace 사용 (성공)
            {
                code: `import * as Vapor from '@vapor-ui/core'; <Vapor.NavigationMenu.Root aria-label="네비" />;`,
            },
            // 4. .Root가 아닌 다른 서브 컴포넌트 (무시)
            {
                code: `import { NavigationMenu } from '@vapor-ui/core'; <NavigationMenu.Item />;`,
            },
            // 5. SideNavigation.Root (성공)
            {
                code: `import { SideNavigation } from '@vapor-ui/core'; <SideNavigation.Root aria-label="서비스" />;`,
            },
            // 6. SideNavigation 서브 경로 import (성공)
            {
                code: `import { SideNavigation } from '@vapor-ui/core/side-navigation'; <SideNavigation.Root aria-label="서비스" />;`,
            },
            // 7. SideNavigation의 .Root가 아닌 서브 컴포넌트 (무시)
            {
                code: `import { SideNavigation } from '@vapor-ui/core'; <SideNavigation.Link href="/" />;`,
            },
        ],
        invalid: [
            // 1. NavigationMenu.Root aria-label 누락
            {
                code: `import { NavigationMenu } from '@vapor-ui/core'; <NavigationMenu.Root />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 2. Breadcrumb.Root (Alias) 누락
            {
                code: `import { Breadcrumb as BC } from '@vapor-ui/core/breadcrumb'; <BC.Root />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 3. Namespace 사용 중 누락
            {
                code: `import * as V from '@vapor-ui/core'; <V.Breadcrumb.Root />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 4. SideNavigation.Root aria-label 누락
            {
                code: `import { SideNavigation } from '@vapor-ui/core'; <SideNavigation.Root />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 5. SideNavigation 서브 경로 import에서 누락
            {
                code: `import { SideNavigation } from '@vapor-ui/core/side-navigation'; <SideNavigation.Root />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 6. Namespace 사용 중 SideNavigation 누락
            {
                code: `import * as V from '@vapor-ui/core'; <V.SideNavigation.Root />;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
        ],
    });
});
