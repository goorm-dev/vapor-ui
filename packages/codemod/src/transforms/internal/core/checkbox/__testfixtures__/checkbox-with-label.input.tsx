// @ts-nocheck
import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <Checkbox id="terms" size="md" invalid={false}>
            <Checkbox.Indicator />
            <Checkbox.Label>약관에 동의합니다</Checkbox.Label>
        </Checkbox>
    </div>
);
