'use client';

import React from 'react';

import clsx from 'clsx';

import IconListItem from '~/components/icon-list-item';
import Tabs from '~/components/ui/tabs';

import { ICON_LIST, VAPOR_ICONS } from './icon-list-tabs.constants';
import styles from './icon-list-tabs.module.scss';

const IconList = () => {
    return (
        <div className={styles.container}>
            <Tabs size="lg" defaultValue={ICON_LIST[0]}>
                <Tabs.List className={styles.tabList}>
                    {ICON_LIST.map((iconType) => {
                        return (
                            <Tabs.Button key={iconType} value={iconType}>
                                {iconType}
                            </Tabs.Button>
                        );
                    })}
                </Tabs.List>
                {ICON_LIST.map((iconType) => (
                    <Tabs.Panel
                        key={iconType}
                        value={iconType}
                        className={clsx(styles.tabPanel, 'pt-4')}
                    >
                        {Object.keys(VAPOR_ICONS[iconType]).map((icon) => (
                            <IconListItem
                                key={icon}
                                icon={VAPOR_ICONS[iconType][icon]}
                                iconName={icon}
                            />
                        ))}
                    </Tabs.Panel>
                ))}
            </Tabs>
        </div>
    );
};

export default IconList;
