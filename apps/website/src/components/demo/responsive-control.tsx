'use client';

import { useCallback, useState } from 'react';

import { Radio, RadioGroup } from '@base-ui/react';
import { PcOutlineIcon, PhoneIcon, TabletIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { DEVICE_TYPES } from '~/constants/code-block';

/* -----------------------------------------------------------------------------------------------*/

const deviceItems = [
    { value: DEVICE_TYPES['DESKTOP'], label: 'Desktop', icon: <PcOutlineIcon size="16" /> },
    { value: DEVICE_TYPES['TABLET'], label: 'Tablet', icon: <TabletIcon size="16" /> },
    { value: DEVICE_TYPES['MOBILE'], label: 'Mobile', icon: <PhoneIcon size="16" /> },
];

type DeviceType = (typeof deviceItems)[number];
type DeviceValue = DeviceType['value'];

/* -----------------------------------------------------------------------------------------------*/

interface ResponsiveControlProps {
    defaultValue?: DeviceValue;
    onValueChange?: (value: DeviceValue) => void;
    className?: string;
}

export function ResponsiveControl({
    defaultValue,
    onValueChange,
    className = '',
}: ResponsiveControlProps) {
    const [selectedValue, setSelectedValue] = useState(defaultValue || deviceItems[0].value);

    const handleValueChange = useCallback(
        (value: DeviceValue) => {
            setSelectedValue(value);
            onValueChange?.(value);
        },
        [onValueChange],
    );

    return (
        <RadioGroup
            value={selectedValue}
            onValueChange={handleValueChange}
            aria-label="Select an option"
            className={clsx(
                'bg-v-gray-100 border border-v-normal rounded-v-300 p-[1px] gap-v-50 absolute right-4 top-1/2 transform-[translateY(-50%)] hidden @md:flex',
                className,
            )}
        >
            {deviceItems.map((item) => (
                <Segment key={item.value} value={item.value} item={item} />
            ))}
        </RadioGroup>
    );
}

/* -----------------------------------------------------------------------------------------------*/

interface SegmentProps extends Radio.Root.Props {
    item: DeviceType;
}

const Segment = ({ item, ...props }: SegmentProps) => {
    return (
        <Radio.Root
            aria-label={`Select ${item.label}`}
            className={clsx(
                'rounded-v-300 relative flex items-center justify-center w-v-300 h-v-300 gap-v-050 border-none bg-transparent cursor-pointer font-medium transition-colors duration-150 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-v-gray-500 hover:text-v-normal-100',
                'data-[checked]:text-v-normal-200 data-[checked]:hover:text-v-normal-100 data-[checked]:bg-v-canvas ',
            )}
            {...props}
        >
            <span className="flex items-center">{item.icon}</span>
        </Radio.Root>
    );
};
Segment.displayName = 'Segment';
