// @ts-nocheck
import { Switch } from '@goorm-dev/vapor-core';

export function SpreadExample() {
    const switchProps = { size: 'md' as const, disabled: false };

    return (
        <Switch {...switchProps}>
            <Switch.Indicator />
        </Switch>
    );
}
