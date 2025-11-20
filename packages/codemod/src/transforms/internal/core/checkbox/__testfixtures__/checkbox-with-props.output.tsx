import { useState } from 'react';

import { Checkbox } from '@vapor-ui/core';

export const Component = () => {
    const [checked, setChecked] = useState(false);

    return (
        // TODO: onCheckedChange 시그니처가 변경되었습니다 - 이제 (checked: CheckedState) 대신 (checked: boolean, event: Event)를 받습니다
        // TODO: checked가 'indeterminate'일 수 있다면 로직을 분리하세요: indeterminate 상태에는 indeterminate prop을, boolean에는 checked prop을 사용하세요
        <Checkbox.Root checked={checked} onCheckedChange={(checked) => console.log(checked)}>
            <Checkbox.IndicatorPrimitive />
        </Checkbox.Root>
    );
};
