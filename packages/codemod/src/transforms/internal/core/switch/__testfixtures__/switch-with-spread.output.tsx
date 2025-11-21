import { Switch } from '@vapor-ui/core';

export function SpreadExample() {
    const switchProps = { size: 'md' as const, disabled: false };

    return (
        <Switch.Root {...switchProps}>
            <Switch.Thumb />
        </Switch.Root>
    );
}
