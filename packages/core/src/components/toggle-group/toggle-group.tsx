import { forwardRef } from 'react';

import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import clsx from 'clsx';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { ToggleGroupVariants } from './toggle-group.css';
import * as styles from './toggle-group.css';

export const [ToggleGroupProvider, useToggleGroupContext] = createContext<ToggleGroupVariants>({
    name: 'ToggleGroup',
    hookName: 'useToggleGroupContext',
    providerName: 'ToggleGroupProvider',
    defaultValue: { size: 'md', variant: 'default' },
    strict: false,
});

/* -------------------------------------------------------------------------------------------------
 * ToggleGroup.Root
 * -----------------------------------------------------------------------------------------------*/

export const ToggleGroupRoot = forwardRef<HTMLDivElement, ToggleGroupRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<ToggleGroupVariants>()(componentProps, [
        'size',
        'variant',
    ]);

    return (
        <ToggleGroupProvider value={variantsProps}>
            <BaseToggleGroup
                ref={ref}
                className={clsx(styles.root(variantsProps), className)}
                {...otherProps}
            />
        </ToggleGroupProvider>
    );
});

/* -------------------------------------------------------------------------------------------------
 * ToggleGroup.Separator
 * -----------------------------------------------------------------------------------------------*/

export const ToggleGroupSeparator = forwardRef<HTMLDivElement, ToggleGroupSeparator.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'div',
            props: {
                role: 'separator',
                className: clsx(styles.separator, className),
                ...componentProps,
            },
        });
    },
);

/* -----------------------------------------------------------------------------------------------*/

export namespace ToggleGroupRoot {
    export type State = BaseToggleGroup.State;
    export type Props = VaporUIComponentProps<typeof BaseToggleGroup, State> & ToggleGroupVariants;
}

export namespace ToggleGroupSeparator {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}
