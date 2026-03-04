import { Tabs, Text } from '@vapor-ui/core';

export default function AnatomyTabs() {
    return (
        <Tabs.Root data-part="Root" defaultValue="overview">
            <Tabs.ListPrimitive data-part="ListPrimitive">
                <Tabs.List data-part="List">
                    <Tabs.Button data-part="Button" value="overview">
                        Overview
                    </Tabs.Button>
                    <Tabs.Button value="features">Features</Tabs.Button>
                    <Tabs.IndicatorPrimitive data-part="IndicatorPrimitive" />
                </Tabs.List>
            </Tabs.ListPrimitive>

            <Tabs.Panel data-part="Panel" value="overview">
                <Text typography="body2" foreground="normal-100">
                    Overview content
                </Text>
            </Tabs.Panel>

            <Tabs.Panel value="features">
                <Text typography="body2" foreground="normal-100">
                    Features content
                </Text>
            </Tabs.Panel>
        </Tabs.Root>
    );
}
