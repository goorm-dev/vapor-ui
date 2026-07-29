import { forwardRef } from 'react';

import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { RootVariants } from './toggle-group.css';
import * as styles from './toggle-group.css';

export const [ToggleGroupProvider, useToggleGroupContext] = createContext<ToggleGroupVariants>({
    name: 'ToggleGroup',
    hookName: 'useToggleGroupContext',
    providerName: 'ToggleGroupProvider',
    defaultValue: { size: 'md' },
    strict: false,
});

/* -------------------------------------------------------------------------------------------------
 * ToggleGroup
 * -----------------------------------------------------------------------------------------------*/

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroup.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [variantsProps, otherProps] = createSplitProps<ToggleGroupVariants>()(componentProps, [
        'size',
    ]);

    return (
        <ToggleGroupProvider value={variantsProps}>
            <BaseToggleGroup
                ref={ref}
                className={clsx(styles.root(variantsProps), className)}
                {...otherProps}
                // `aria-orientation` is not allowed on `role="group"`; strip it until the upstream
                // fix ships. See https://github.com/mui/base-ui/pull/4628.
                aria-orientation={undefined}
            />
        </ToggleGroupProvider>
    );
});
ToggleGroup.displayName = 'ToggleGroup';

/* -----------------------------------------------------------------------------------------------*/

type ToggleGroupVariants = RootVariants;

export namespace ToggleGroup {
    export type State = BaseToggleGroup.State;
    export type Props = VaporUIComponentProps<typeof BaseToggleGroup, State> & ToggleGroupVariants;
}
