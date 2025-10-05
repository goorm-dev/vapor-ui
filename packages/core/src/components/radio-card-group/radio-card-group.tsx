'use client';

import { forwardRef } from 'react';

import { RadioGroup as BaseRadioGroup } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { RootVariants } from './radio-card-group.css';
import * as styles from './radio-card-group.css';

type RadioCardGroupVariants = RootVariants;
type RadioCardGroupSharedProps = RadioCardGroupVariants & { invalid?: boolean };

type RadioCardGroupContext = RadioCardGroupSharedProps;

export const [RadioCardGroupProvider, useRadioCardGroupContext] =
    createContext<RadioCardGroupContext>({
        name: 'RadioCardGroup',
        hookName: 'useRadioCardGroupContext',
        providerName: 'RadioCardGroupProvider',
        defaultValue: { size: 'md', orientation: 'vertical', invalid: false },
        strict: false,
    });

/* -------------------------------------------------------------------------------------------------
 * RadioCardGroup.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = VComponentProps<typeof BaseRadioGroup>;
interface RadioCardGroupRootProps extends RootPrimitiveProps, RadioCardGroupSharedProps {}

const Root = forwardRef<HTMLDivElement, RadioCardGroupRootProps>(({ className, ...props }, ref) => {
    const [variantProps, otherProps] = createSplitProps<RadioCardGroupSharedProps>()(props, [
        'size',
        'invalid',
        'orientation',
    ]);

    const { size, orientation, invalid } = variantProps;

    return (
        <RadioCardGroupProvider value={{ invalid, ...variantProps }}>
            <BaseRadioGroup
                ref={ref}
                aria-invalid={invalid}
                aria-orientation={orientation}
                className={clsx(styles.root({ size, orientation }), className)}
                {...otherProps}
            />
        </RadioCardGroupProvider>
    );
});
Root.displayName = 'RadioCardGroup.Root';

/* -----------------------------------------------------------------------------------------------*/

export { Root as RadioCardGroupRoot };
export type { RadioCardGroupRootProps };

export const RadioCardGroup = { Root };
