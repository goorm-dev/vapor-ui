import { Fragment } from 'react';

import { HStack, Menu, Text } from '@vapor-ui/core';
import { ChevronDownOutlineIcon, OpenInNewOutlineIcon } from '@vapor-ui/icons';

import pkg from '../../../../packages/core/package.json' with { type: 'json' };

const currentVersion = pkg?.version;
const items = [
    { label: `v${currentVersion.split('.').at(0)}`, type: 'latest', value: currentVersion },
    { label: 'beta', type: 'legacy', value: 'beta.x', url: 'https://beta.vapor-ui.goorm.io' },
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
                                    <a href={item.url} target="_blank" rel="noreferrer">
                                        <HStack gap="$075" alignItems="center">
                                            <Text typography="subtitle1">{item.label}</Text>

                                            {item.type === 'legacy' && (
                                                <OpenInNewOutlineIcon size={12} />
                                            )}
                                        </HStack>
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
