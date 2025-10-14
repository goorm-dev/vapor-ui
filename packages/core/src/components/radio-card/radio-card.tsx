'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui-components/react';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RootVariants } from './radio-card.css';
import * as styles from './radio-card.css';

/* -------------------------------------------------------------------------------------------------
 * RadioCard.Root
 * -----------------------------------------------------------------------------------------------*/

type RadioCardVariants = Omit<RootVariants, 'size'>;

type RootPrimitiveProps = VComponentProps<typeof BaseRadio.Root>;
interface RadioCardRootProps extends RootPrimitiveProps, RadioCardVariants {}

const Root = forwardRef<HTMLButtonElement, RadioCardRootProps>(
    ({ className, children, ...props }, ref) => {
        const { size, invalid: contextInvalid } = useRadioGroupContext();

        const [variantProps, otherProps] = createSplitProps<RadioCardVariants>()(props, [
            'invalid',
        ]);
        const { invalid: invalidProp } = variantProps;

        const invalid = invalidProp || contextInvalid;

        return (
            <BaseRadio.Root
                ref={ref}
                aria-invalid={invalid}
                className={clsx(styles.root({ size, invalid }), className)}
                {...otherProps}
            >
                {children}
            </BaseRadio.Root>
        );
    },
);
Root.displayName = 'RadioCard.Root';

/* -----------------------------------------------------------------------------------------------*/

export { Root as RadioCardRoot };
export type { RadioCardRootProps };
export const RadioCard = { Root };
