import './filter-form.css';

import { useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    Collapsible,
    HStack,
    Radio,
    RadioGroup,
    Text,
    VStack,
} from '@vapor-ui/core';
import { ChevronDownOutlineIcon, RefreshOutlineIcon } from '@vapor-ui/icons';

export default function FilterForm() {
    const [sort, setSort] = useState({
        feedback: false,
        buttons: true,
        'data-display': false,
        overlay: false,
        inputs: true,
        navigation: false,
        utils: false,
    });

    const handleSortChange = (key: keyof typeof sort) => (checked: boolean) => {
        setSort((prev) => ({ ...prev, [key]: checked }));
    };

    return (
        <VStack width="17.625rem" className="filter">
            <HStack justifyContent="space-between">
                <Text typography="heading5">Filter</Text>
                <Button size="sm" variant="ghost" color="secondary" disabled>
                    <RefreshOutlineIcon />
                    Refresh
                </Button>
            </HStack>

            <Box
                render={<hr />}
                border="none"
                marginY="$150"
                height="1px"
                width="100%"
                backgroundColor="$gray-300"
            />

            <VStack gap="$300">
                <Collapsible.Root render={<VStack gap="$150" />}>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">View</Text>

                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <RadioGroup.Root>
                            <HStack gap="$100" alignItems="center">
                                <Radio.Root id="filter-recent" value="recent" />
                                <label htmlFor="filter-recent" className="radio-label">
                                    Recent
                                </label>
                            </HStack>

                            <HStack gap="$100" alignItems="center">
                                <Radio.Root id="filter-popular" value="popular" />
                                <label htmlFor="filter-popular" className="radio-label">
                                    Most Popular
                                </label>
                            </HStack>
                        </RadioGroup.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root render={<VStack gap="$150" />}>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">
                            Sort{' '}
                            <Text foreground="primary">
                                {Object.values(sort).filter((v) => v).length}
                            </Text>
                        </Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="filter-feedback"
                                checked={sort.feedback}
                                onCheckedChange={handleSortChange('feedback')}
                            />
                            <label htmlFor="filter-feedback" className="checkbox-label">
                                Feedback
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="filter-buttons"
                                checked={sort.buttons}
                                onCheckedChange={handleSortChange('buttons')}
                            />
                            <label htmlFor="filter-buttons" className="checkbox-label">
                                Buttons
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="filter-data-display"
                                checked={sort['data-display']}
                                onCheckedChange={handleSortChange('data-display')}
                            />
                            <label htmlFor="filter-data-display" className="checkbox-label">
                                Data Display
                            </label>
                        </HStack>

                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="filter-overlay"
                                checked={sort.overlay}
                                onCheckedChange={handleSortChange('overlay')}
                            />
                            <label htmlFor="filter-overlay" className="checkbox-label">
                                Overlay
                            </label>
                        </HStack>

                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="filter-inputs"
                                checked={sort.inputs}
                                onCheckedChange={handleSortChange('inputs')}
                            />
                            <label htmlFor="filter-inputs" className="checkbox-label">
                                Inputs
                            </label>
                        </HStack>

                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="filter-navigation"
                                checked={sort.navigation}
                                onCheckedChange={handleSortChange('navigation')}
                            />
                            <label htmlFor="filter-navigation" className="checkbox-label">
                                Navigation
                            </label>
                        </HStack>

                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="filter-utils"
                                checked={sort.utils}
                                onCheckedChange={handleSortChange('utils')}
                            />
                            <label htmlFor="filter-utils" className="checkbox-label">
                                Utils
                            </label>
                        </HStack>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root render={<VStack gap="$150" />}>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Package</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-goorm-dev/vapor-core" />
                            <label htmlFor="filter-goorm-dev/vapor-core" className="checkbox-label">
                                goorm-dev/vapor-core
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-goorm-dev/vapor-component" />
                            <label
                                htmlFor="filter-goorm-dev/vapor-component"
                                className="checkbox-label"
                            >
                                goorm-dev/vapor-component
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-vapor-ui/core" />
                            <label htmlFor="filter-vapor-ui/core" className="checkbox-label">
                                vapor-ui/core
                            </label>
                        </HStack>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root render={<VStack gap="$150" />}>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Status</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-active" />
                            <label htmlFor="filter-active" className="checkbox-label">
                                Active
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-inactive" />
                            <label htmlFor="filter-inactive" className="checkbox-label">
                                Inactive
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-draft" />
                            <label htmlFor="filter-draft" className="checkbox-label">
                                Draft
                            </label>
                        </HStack>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root render={<VStack gap="$150" />}>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Tag</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-ui" />
                            <label htmlFor="filter-ui" className="checkbox-label">
                                UI
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-open-source" />
                            <label htmlFor="filter-open-source" className="checkbox-label">
                                Open Source
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="filter-performance" />
                            <label htmlFor="filter-performance" className="checkbox-label">
                                Performance
                            </label>
                        </HStack>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>
        </VStack>
    );
}
