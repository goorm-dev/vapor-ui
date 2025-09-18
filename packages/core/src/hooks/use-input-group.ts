import { useEffect } from 'react';

import type { Field } from '@base-ui-components/react';

import { useInputGroupContext } from '~/components/input-group';

interface UseInputGroupSyncOptions {
    value?: Field.Control.Props['value'];
    defaultValue?: Field.Control.Props['defaultValue'];
    maxLength?: Field.Control.Props['maxLength'];
}

/**
 * Custom hook to handle InputGroup context synchronization
 * Separates InputGroup-related logic from TextInput component
 */
export function useInputGroup({ value, defaultValue, maxLength }: UseInputGroupSyncOptions) {
    const groupContext = useInputGroupContext();

    // Sync maxLength with InputGroup context on mount
    useEffect(() => {
        if (groupContext?.setMaxLength && maxLength !== undefined) {
            groupContext.setMaxLength(maxLength);
        }
    }, [groupContext, maxLength]);

    // Update context when value changes (including initial value)
    useEffect(() => {
        if (groupContext?.updateValue) {
            const currentValue = value ?? defaultValue ?? '';
            groupContext.updateValue(currentValue);
        }
    }, [groupContext, value, defaultValue]);

    // Return a function to update InputGroup on change
    const syncOnChange = (newValue: Field.Control.Props['value']) => {
        if (groupContext?.updateValue) {
            groupContext.updateValue(newValue);
        }
    };

    return {
        syncOnChange,
        isInGroup: !!groupContext,
    };
}
