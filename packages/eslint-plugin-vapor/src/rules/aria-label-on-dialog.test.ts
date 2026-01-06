import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import { ariaLabelOnDialogRule } from './aria-label-on-dialog';

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

describe('aria-label-on-dialog-rule', () => {
    ruleTester.run('aria-label-on-dialog', ariaLabelOnDialogRule, {
        valid: [
            // 1. Dialog.Popup (Success)
            {
                code: `import { Dialog } from '@vapor-ui/core'; <Dialog.Popup aria-label="confirm dialog">Contents</Dialog.Popup>;`,
            },
            // 2. Popover.Popup (Success)
            {
                code: `import { Popover } from '@vapor-ui/core'; <Popover.Popup aria-label="menu popover">Contents</Popover.Popup>;`,
            },
            // 3. Sheet.PopupPrimitive (Success)
            {
                code: `import { Sheet } from '@vapor-ui/core'; <Sheet.PopupPrimitive aria-label="side sheet">Contents</Sheet.PopupPrimitive>;`,
            },
            // 4. Namespace Usage (Success)
            {
                code: `import * as Vapor from '@vapor-ui/core'; <Vapor.Dialog.Popup aria-label="dialog">Contents</Vapor.Dialog.Popup>;`,
            },
            // 5. Import subpath (Success)
            {
                code: `import { Dialog } from '@vapor-ui/core/dialog'; <Dialog.Popup aria-label="dialog">Contents</Dialog.Popup>;`,
            },
            // 6. Other sub-components (Ignore)
            {
                code: `import { Dialog } from '@vapor-ui/core'; <Dialog.Body>Body</Dialog.Body>;`,
            },
        ],
        invalid: [
            // 1. Dialog.Popup missing aria-label
            {
                code: `import { Dialog } from '@vapor-ui/core'; <Dialog.Popup>Contents</Dialog.Popup>;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 2. Popover.PopupPrimitive missing aria-label
            {
                code: `import { Popover } from '@vapor-ui/core'; <Popover.PopupPrimitive>Contents</Popover.PopupPrimitive>;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 3. Sheet.Popup (Alias) missing aria-label
            {
                code: `import { Sheet as MySheet } from '@vapor-ui/core'; <MySheet.Popup>Contents</MySheet.Popup>;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 4. Namespace usage missing aria-label
            {
                code: `import * as Vapor from '@vapor-ui/core'; <Vapor.Dialog.Popup>Contents</Vapor.Dialog.Popup>;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
            // 5. Import from subpath missing aria-label
            {
                code: `import { Dialog } from '@vapor-ui/core/dialog'; <Dialog.Popup>Contents</Dialog.Popup>;`,
                errors: [{ messageId: 'missingAriaLabel' }],
            },
        ],
    });
});
