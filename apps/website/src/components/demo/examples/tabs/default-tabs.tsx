import { Tabs } from '@vapor-ui/core';

export default function DefaultTabs() {
    return (
        <Tabs.Root defaultValue="overview">
            <Tabs.List>
                <Tabs.Trigger value="overview">개요</Tabs.Trigger>
                <Tabs.Trigger value="features">기능</Tabs.Trigger>
                <Tabs.Trigger value="examples">예시</Tabs.Trigger>
                <Tabs.Trigger value="api">API</Tabs.Trigger>
                <Tabs.Indicator />
            </Tabs.List>

            <Tabs.Panel value="overview">
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">개요</h3>
                    <p className="text-gray-600">
                        Tabs 컴포넌트는 관련된 콘텐츠를 탭 형태로 구성하여 사용자가 쉽게 전환할 수
                        있도록 합니다.
                    </p>
                </div>
            </Tabs.Panel>

            <Tabs.Panel value="features">
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">기능</h3>
                    <p className="text-gray-600">
                        키보드 내비게이션, 접근성, 다양한 스타일 변형을 지원합니다.
                    </p>
                </div>
            </Tabs.Panel>

            <Tabs.Panel value="examples">
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">예시</h3>
                    <p className="text-gray-600">
                        다양한 사용 사례와 커스터마이징 방법을 확인할 수 있습니다.
                    </p>
                </div>
            </Tabs.Panel>

            <Tabs.Panel value="api">
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">API</h3>
                    <p className="text-gray-600">
                        컴포넌트의 props와 사용법에 대한 상세 정보를 제공합니다.
                    </p>
                </div>
            </Tabs.Panel>
        </Tabs.Root>
    );
}
