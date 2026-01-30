import type { API, Collection } from 'jscodeshift';

import { getLocalComponentName } from '../utils/import-verification';

/**
 * Remove `onClearErrors` prop from Form component.
 *
 * In the new API, errors passed via `errors` prop are automatically cleared
 * when the field value changes, making `onClearErrors` unnecessary.
 *
 * Only transforms Form components imported from @vapor-ui/core.
 * Supports aliased imports (e.g., import { Form as VaporForm }).
 *
 * | Original                                | Transformed               |
 * |-----------------------------------------|---------------------------|
 * | `<Form onClearErrors={handler}>`        | `<Form>`                  |
 * | `<Form errors={e} onClearErrors={fn}>`  | `<Form errors={e}>`       |
 */
export function transformFormOnClearErrors(j: API['jscodeshift'], root: Collection): void {
    // Get the local name for Form from @vapor-ui/core
    const formLocalName = getLocalComponentName(j, root, 'Form');

    // Early return if Form is not imported from @vapor-ui/core
    if (!formLocalName) {
        return;
    }

    // Find Form elements with onClearErrors prop (using local name)
    root.find(j.JSXElement, {
        openingElement: {
            name: {
                type: 'JSXIdentifier',
                name: formLocalName, // Use local name (respects alias)
            },
        },
    }).forEach((elementPath) => {
        const openingElement = elementPath.value.openingElement;

        // Filter out the onClearErrors attribute
        openingElement.attributes = openingElement.attributes?.filter(
            (attr) =>
                !(
                    attr.type === 'JSXAttribute' &&
                    attr.name.type === 'JSXIdentifier' &&
                    attr.name.name === 'onClearErrors'
                ),
        );
    });
}
