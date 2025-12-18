import { Tabs } from '@vapor-ui/core';

export default function TabsCustomIndicator() {
    return (
        <Tabs.Root defaultValue="home">
            <Tabs.List
                indicatorElement={
                    <Tabs.IndicatorPrimitive
                        className="bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ height: '4px', borderRadius: '2px' }}
                    />
                }
            >
                <Tabs.Button value="home">홈</Tabs.Button>
                <Tabs.Button value="about">소개</Tabs.Button>
                <Tabs.Button value="services">서비스</Tabs.Button>
            </Tabs.List>
        </Tabs.Root>
    );
}
