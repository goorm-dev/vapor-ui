// @ts-nocheck
import { Checkbox as VaporCheckbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <VaporCheckbox id="terms" size="md">
            <VaporCheckbox.Indicator />
            <VaporCheckbox.Label>약관에 동의합니다</VaporCheckbox.Label>
        </VaporCheckbox>
    </div>
);
