import type { ComponentPropsWithoutRef } from 'react';

import type { useRender } from '@base-ui-components/react/use-render';

type ColorPropToOmit<ElementType extends React.ElementType> =
    string extends ComponentPropsWithoutRef<ElementType>['color'] ? 'color' : never;

export type VComponentProps<ElementType extends React.ElementType> = Omit<
    useRender.ComponentProps<ElementType>,
    'defaultValue' | 'dir' | ColorPropToOmit<ElementType>
>;
