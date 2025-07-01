'use client';

import React from 'react';

import Tabs from '~/components/ui/tabs';
import {
    FontFamilyData,
    FontSizeData,
    FontWeightData,
    LetterSpacingData,
    LineHeightData,
} from '~/constants/typography';

import TypographyTable from './typography-table';

export const FoundationTypographyTabs = () => {
    return (
        <Tabs size="xl" defaultValue="FontFamily">
            <Tabs.List className="mt-0">
                <Tabs.Button value="FontFamily">Font Family</Tabs.Button>
                <Tabs.Button value="FontSize">Font Size</Tabs.Button>
                <Tabs.Button value="FontWeight">Font Weight</Tabs.Button>
                <Tabs.Button value="LetterSpacing">Letter Spacing</Tabs.Button>
                <Tabs.Button value="LineHeight">Line Height</Tabs.Button>
            </Tabs.List>
            <Tabs.Panel value="FontFamily" className="mt-10">
                <TypographyTable tokens={FontFamilyData} />
            </Tabs.Panel>
            <Tabs.Panel value="FontSize" className="mt-10">
                <TypographyTable tokens={FontSizeData} />
            </Tabs.Panel>
            <Tabs.Panel value="FontWeight" className="mt-10">
                <TypographyTable tokens={FontWeightData} />
            </Tabs.Panel>
            <Tabs.Panel value="LetterSpacing" className="mt-10">
                <TypographyTable tokens={LetterSpacingData} />
            </Tabs.Panel>
            <Tabs.Panel value="LineHeight" className="mt-10">
                <TypographyTable tokens={LineHeightData} />
            </Tabs.Panel>
        </Tabs>
    );
};

export default FoundationTypographyTabs;
