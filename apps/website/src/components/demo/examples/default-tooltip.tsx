'use client';

import { Button, Tooltip } from '@vapor-ui/core';

export default function DefaultTooltip() {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger render={<Button>툴팁 보기</Button>} />
            <Tooltip.Portal>
                <Tooltip.Content>유용한 정보를 제공하는 툴팁입니다.</Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}
