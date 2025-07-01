'use client';

import { Text } from '@vapor-ui/core';

import Tabs from '~/components/ui/tabs';
import { BasicColorData, SemanticColorData } from '~/constants/colors';

import styles from './foundation-color-boxes.module.scss';

type ColorBoxProps = {
    color: string;
    value: string;
    basicToken?: string;
};

function ColorBox({ color, value, basicToken }: ColorBoxProps) {
    return (
        <div className={styles.box}>
            <div
                className={styles.palette}
                style={{
                    backgroundColor: value,
                }}
            />
            <div className={styles.descriptions}>
                <Text typography="subtitle1" foreground="hint">
                    {value.toUpperCase()}
                </Text>
                <Text typography="subtitle1" foreground="hint-darker" className={styles.description}>
                    {color}
                </Text>
                {basicToken && (
                    <Text typography="subtitle1" foreground="normal" className={styles.description}>
                        {basicToken}
                    </Text>
                )}
            </div>
        </div>
    );
}

type ColorBoxesProps = {
    tokens: {
        title: string;
        colorShade: {
            name: string;
            value: string;
            basicToken?: string; // Optional, used in semantic colors
        }[];
    }[];
};
const ColorBoxes = ({ tokens }: ColorBoxesProps) => {
    return (
        <div className="flex flex-col gap-10">
            {tokens.map(({ title, colorShade }) => (
                <section key={title} className="flex flex-col gap-2.5">
                    <Text typography="heading5">{title}</Text>

                    <div className={styles.boxes}>
                        {colorShade.map(({ name, value, basicToken }) => (
                            <ColorBox
                                key={name}
                                color={name}
                                value={value}
                                basicToken={basicToken}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export const FoundationColorTabs = () => {
    return (
        <Tabs size="xl" defaultValue="basic">
            <Tabs.List className={styles.tabsList}>
                <Tabs.Button value="basic">Basic</Tabs.Button>
                <Tabs.Button value="semantic">Semantic</Tabs.Button>
            </Tabs.List>

            <Tabs.Panel value="basic" className={styles.tabsPanel}>
                <ColorBoxes tokens={BasicColorData} />
            </Tabs.Panel>
            <Tabs.Panel value="semantic" className={styles.tabsPanel}>
                <ColorBoxes tokens={SemanticColorData} />
            </Tabs.Panel>
        </Tabs>
    );
};

export default FoundationColorTabs;
