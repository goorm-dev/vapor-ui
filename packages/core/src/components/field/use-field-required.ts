'use client';

import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';

import { useFieldContext } from './field';

/**
 * Propagates the control's `required` prop to the surrounding `Field.Root`
 * so that `Field.RequiredSymbol` can render only when needed. Resets the
 * context value on unmount.
 */
export const useFieldRequired = (required: boolean | undefined) => {
    const { setRequired } = useFieldContext();

    useIsoLayoutEffect(() => {
        setRequired(!!required);

        return () => setRequired(false);
    }, [required, setRequired]);
};
