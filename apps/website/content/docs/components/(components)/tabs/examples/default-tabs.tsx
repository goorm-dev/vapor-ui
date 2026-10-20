import { Tabs } from '@vapor-ui/core';
import { AiSmartieIcon, AssignmentIcon, ListIcon } from '@vapor-ui/icons';

export default function DefaultTabs() {
    return (
        <Tabs.Root defaultValue="overview" className="max-w-[200px] w-full mx-auto">
            <Tabs.List>
                <Tabs.Button value="overview">개요</Tabs.Button>
                <Tabs.Button value="features">기능</Tabs.Button>
                <Tabs.Button value="examples">예시</Tabs.Button>
            </Tabs.List>

            <Tabs.Panel value="overview" className="h-[100px] flex items-center justify-center">
                <AssignmentIcon size="32px" />
            </Tabs.Panel>

            <Tabs.Panel value="features" className="h-[100px] flex items-center justify-center">
                <AiSmartieIcon size="32px" />
            </Tabs.Panel>

            <Tabs.Panel value="examples" className="h-[100px] flex items-center justify-center">
                <ListIcon size="32px" />
            </Tabs.Panel>
        </Tabs.Root>
    );
}
