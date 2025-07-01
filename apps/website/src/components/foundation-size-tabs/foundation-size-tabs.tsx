'use client';

import Tabs from '~/components/ui/tabs';
import { BorderRadiusData, DimensionData, SpaceData } from '~/constants/size';

import styles from './foundation-size-tabs.module.scss';
import SizeTable from './size-table';

export const FoundationSizeTabs = () => {
    return (
        <Tabs size="xl" defaultValue="Dimension">
            <Tabs.List className={styles.tabsList}>
                <Tabs.Button value="Dimension">Dimension</Tabs.Button>
                <Tabs.Button value="Space">Space</Tabs.Button>
                <Tabs.Button value="BorderRadius">Border Radius</Tabs.Button>
            </Tabs.List>
            <Tabs.Panel value="Dimension" className={styles.tabsPanel}>
                <SizeTable
                    header="Dimension"
                    description="UI의 width, height 값을 정의하는데 사용합니다."
                    sizes={DimensionData}
                />
            </Tabs.Panel>
            <Tabs.Panel value="Space" className={styles.tabsPanel}>
                <SizeTable
                    header="Space"
                    description="UI의 체계적인 배열 구성을 위해 일정한 요소와 간격을 사용합니다."
                    sizes={SpaceData}
                />
            </Tabs.Panel>
            <Tabs.Panel value="BorderRadius" className={styles.tabsPanel}>
                <SizeTable
                    header="Border Radius"
                    description="버튼, 텍스트 입력 상자 등 디자인 구성 요소 컨테이너에 적용되는 모서리 스타일 속성을 정의합니다."
                    sizes={BorderRadiusData}
                    sizeType="borderRadius"
                />
            </Tabs.Panel>
        </Tabs>
    );
};

export default FoundationSizeTabs;
