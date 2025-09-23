import { Collapsible } from '@vapor-ui/core';

export default function CollapsibleDisabled() {
    return (
        <Collapsible.Root disabled>
            <Collapsible.Trigger className="px-4 py-2 bg-v-gray-400 text-v-white rounded cursor-not-allowed">
                비활성화된 Collapsible
            </Collapsible.Trigger>
            <Collapsible.Panel className="mt-2 p-4 border border-v-gray-200 rounded bg-v-gray-50">
                이 콘텐츠는 토글할 수 없습니다.
            </Collapsible.Panel>
        </Collapsible.Root>
    );
}
