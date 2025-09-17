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

export default function Filter() {
    const [sort, setSort] = useState({
        feedback: false,
        buttons: true,
        'data-display': false,
        overlay: false,
        inputs: true,
        navigation: false,
        utils: false,
    });

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
                                <Radio.Root id="recent" value="recent" />
                                <label htmlFor="recent" className="radio-label">
                                    Recent
                                </label>
                            </HStack>

                            <HStack gap="$100" alignItems="center">
                                <Radio.Root id="popular" value="popular" />
                                <label htmlFor="popular" className="radio-label">
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
                                id="feedback"
                                checked={sort.feedback}
                                onCheckedChange={(checked) =>
                                    setSort((prev) => ({ ...prev, feedback: checked }))
                                }
                            />
                            <label htmlFor="feedback" className="checkbox-label">
                                Feedback
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="buttons"
                                checked={sort.buttons}
                                onCheckedChange={(checked) =>
                                    setSort((prev) => ({ ...prev, buttons: checked }))
                                }
                            />
                            <label htmlFor="buttons" className="checkbox-label">
                                Buttons
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="data-display"
                                checked={sort['data-display']}
                                onCheckedChange={(checked) =>
                                    setSort((prev) => ({ ...prev, 'data-display': checked }))
                                }
                            />
                            <label htmlFor="data-display" className="checkbox-label">
                                Data Display
                            </label>
                        </HStack>

                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="overlay"
                                checked={sort.overlay}
                                onCheckedChange={(checked) =>
                                    setSort((prev) => ({ ...prev, overlay: checked }))
                                }
                            />
                            <label htmlFor="overlay" className="checkbox-label">
                                Overlay
                            </label>
                        </HStack>

                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="inputs"
                                checked={sort.inputs}
                                onCheckedChange={(checked) =>
                                    setSort((prev) => ({ ...prev, inputs: checked }))
                                }
                            />
                            <label htmlFor="inputs" className="checkbox-label">
                                Inputs
                            </label>
                        </HStack>

                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="auto-login"
                                checked={sort.navigation}
                                onCheckedChange={(checked) =>
                                    setSort((prev) => ({ ...prev, navigation: checked }))
                                }
                            />
                            <label htmlFor="auto-login" className="checkbox-label">
                                Navigation
                            </label>
                        </HStack>

                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root
                                id="utils"
                                checked={sort.utils}
                                onCheckedChange={(checked) =>
                                    setSort((prev) => ({ ...prev, utils: checked }))
                                }
                            />
                            <label htmlFor="utils" className="checkbox-label">
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
                            <Checkbox.Root id="goorm-dev/vapor-core" />
                            <label htmlFor="goorm-dev/vapor-core" className="checkbox-label">
                                goorm-dev/vapor-core
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="goorm-dev/vapor-component" />
                            <label htmlFor="goorm-dev/vapor-component" className="checkbox-label">
                                goorm-dev/vapor-component
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="vapor-ui/core" />
                            <label htmlFor="vapor-ui/core" className="checkbox-label">
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
                            <Checkbox.Root id="active" />
                            <label htmlFor="active" className="checkbox-label">
                                Active
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="inactive" />
                            <label htmlFor="inactive" className="checkbox-label">
                                Inactive
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="draft" />
                            <label htmlFor="draft" className="checkbox-label">
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
                            <Checkbox.Root id="ui" />
                            <label htmlFor="ui" className="checkbox-label">
                                UI
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="open-source" />
                            <label htmlFor="open-source" className="checkbox-label">
                                Open Source
                            </label>
                        </HStack>
                        <HStack alignItems="center" gap="$100">
                            <Checkbox.Root id="performance" />
                            <label htmlFor="performance" className="checkbox-label">
                                Performance
                            </label>
                        </HStack>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>
        </VStack>
    );
}
