import { useEffect } from 'react';

import { useInputGroupContext } from '~/components/input-group';

interface UseInputGroupSyncOptions {
    value?: string;
    defaultValue?: string;
    maxLength?: number;
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
    const syncOnChange = (newValue: string) => {
        if (groupContext?.updateValue) {
            groupContext.updateValue(newValue);
        }
    };

    return {
        syncOnChange,
        isInGroup: !!groupContext,
    };
}
