import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';

import type { useRender } from '@base-ui-components/react/use-render';

type OmitProp<
    ElementType extends React.ElementType,
    key extends keyof HTMLAttributes<ElementType>,
> = string extends ComponentPropsWithoutRef<ElementType>[key] ? key : never;

export type VComponentProps<ElementType extends React.ElementType> = Omit<
    useRender.ComponentProps<ElementType>,
    | OmitProp<ElementType, 'defaultChecked'>
    | OmitProp<ElementType, 'defaultValue'>
    | OmitProp<ElementType, 'dir'>
    | OmitProp<ElementType, 'color'>
>;
