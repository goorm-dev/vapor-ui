import { Tabs } from '@vapor-ui/core';

export default function TabsCustomIndicator() {
    return (
        <Tabs.Root defaultValue="home">
            <Tabs.List
                indicatorElement={
                    <Tabs.IndicatorPrimitive
                        className="bg-gradient-to-r from-red-600 to-orange-400"
                        style={{ height: '4px', borderRadius: '2px' }}
                    />
                }
            >
                <Tabs.Button value="home" $styles={{ width: '5rem' }}>
                    홈
                </Tabs.Button>
                <Tabs.Button value="about" $styles={{ width: '5rem' }}>
                    소개
                </Tabs.Button>
                <Tabs.Button value="services" $styles={{ width: '5rem' }}>
                    서비스
                </Tabs.Button>
            </Tabs.List>
        </Tabs.Root>
    );
}
