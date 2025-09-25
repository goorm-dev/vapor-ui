import { Tabs } from '@vapor-ui/core';

export default function TabsKeyboard() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">
                    포커스 시 활성화 (activateOnFocus: true)
                </h4>
                <Tabs.Root defaultValue="tab1" activateOnFocus={true}>
                    <Tabs.List>
                        <Tabs.Trigger value="tab1">탭 1</Tabs.Trigger>
                        <Tabs.Trigger value="tab2">탭 2</Tabs.Trigger>
                        <Tabs.Trigger value="tab3">탭 3</Tabs.Trigger>
                        <Tabs.Indicator />
                    </Tabs.List>
                    <Tabs.Panel value="tab1">
                        <div className="p-4 border rounded-md">
                            키보드 화살표 키로 탭을 이동하면 바로 활성화됩니다.
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="tab2">
                        <div className="p-4 border rounded-md">두 번째 탭의 내용입니다.</div>
                    </Tabs.Panel>
                    <Tabs.Panel value="tab3">
                        <div className="p-4 border rounded-md">세 번째 탭의 내용입니다.</div>
                    </Tabs.Panel>
                </Tabs.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">
                    엔터/스페이스로 활성화 (activateOnFocus: false)
                </h4>
                <Tabs.Root defaultValue="tab1" activateOnFocus={false}>
                    <Tabs.List>
                        <Tabs.Trigger value="tab1">탭 1</Tabs.Trigger>
                        <Tabs.Trigger value="tab2">탭 2</Tabs.Trigger>
                        <Tabs.Trigger value="tab3">탭 3</Tabs.Trigger>
                        <Tabs.Indicator />
                    </Tabs.List>
                    <Tabs.Panel value="tab1">
                        <div className="p-4 border rounded-md">
                            화살표 키로 포커스를 이동하고, Enter나 Space로 활성화합니다.
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="tab2">
                        <div className="p-4 border rounded-md">두 번째 탭의 내용입니다.</div>
                    </Tabs.Panel>
                    <Tabs.Panel value="tab3">
                        <div className="p-4 border rounded-md">세 번째 탭의 내용입니다.</div>
                    </Tabs.Panel>
                </Tabs.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">순환 내비게이션 (loop: true)</h4>
                <Tabs.Root defaultValue="tab1" loop={true} activateOnFocus={false}>
                    <Tabs.List>
                        <Tabs.Trigger value="tab1">탭 1</Tabs.Trigger>
                        <Tabs.Trigger value="tab2">탭 2</Tabs.Trigger>
                        <Tabs.Trigger value="tab3">탭 3</Tabs.Trigger>
                        <Tabs.Indicator />
                    </Tabs.List>
                    <Tabs.Panel value="tab1">
                        <div className="p-4 border rounded-md">
                            마지막 탭에서 화살표 키를 누르면 첫 번째 탭으로 순환됩니다.
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="tab2">
                        <div className="p-4 border rounded-md">두 번째 탭의 내용입니다.</div>
                    </Tabs.Panel>
                    <Tabs.Panel value="tab3">
                        <div className="p-4 border rounded-md">
                            마지막 탭에서 오른쪽 화살표를 누르면 첫 번째 탭으로 이동합니다.
                        </div>
                    </Tabs.Panel>
                </Tabs.Root>
            </div>
        </div>
    );
}
