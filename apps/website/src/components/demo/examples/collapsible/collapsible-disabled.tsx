import { Button, Collapsible } from '@vapor-ui/core';

export default function CollapsibleDisabled() {
    return (
        <Collapsible.Root disabled>
            <Collapsible.Trigger render={<Button color="danger" />}>
                비활성화된 Collapsible
            </Collapsible.Trigger>
            <Collapsible.Panel>이 콘텐츠는 토글할 수 없습니다.</Collapsible.Panel>
        </Collapsible.Root>
    );
}
