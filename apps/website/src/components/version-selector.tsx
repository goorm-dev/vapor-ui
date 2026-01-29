import { Fragment } from 'react';

import { Menu, Text } from '@vapor-ui/core';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';

import pkg from '../../../../packages/core/package.json' with { type: 'json' };

const currentVersion = pkg?.version;
const items = [
    { label: `v${currentVersion.split('.').at(0)}`, value: currentVersion },
    { label: 'beta', value: 'beta.x', url: 'https://beta.vapor-ui.goorm.io' },
];

export const VersionSelector = () => {
    return (
        <Menu.Root>
            <Menu.Trigger
                display="flex"
                alignItems="center"
                gap="$050"
                className="text-v-hint-100 hover:text-v-gray-400 transition-colors"
            >
                <Text color="inherit" typography="subtitle1">
                    {items.at(0)?.value}
                </Text>
                <ChevronDownOutlineIcon className="group-hover:text-v-gray-400 transition-colors" />
            </Menu.Trigger>

            <Menu.Popup>
                {items.map((item, index) => {
                    return (
                        <Fragment key={item.label}>
                            <Menu.Item
                                justifyContent="space-between"
                                render={
                                    <a href={item.url}>
                                        <Text typography="subtitle1">{item.label}</Text>
                                        <Text color="$hint-100" typography="subtitle2">
                                            {item.value}
                                        </Text>
                                    </a>
                                }
                            />
                            {index < items.length - 1 && <Menu.Separator />}
                        </Fragment>
                    );
                })}
            </Menu.Popup>
        </Menu.Root>
    );
};
