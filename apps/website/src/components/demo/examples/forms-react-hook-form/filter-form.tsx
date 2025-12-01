import './filter-form.css';

import { Controller, useForm } from 'react-hook-form';

import {
    Box,
    Button,
    Checkbox,
    Collapsible,
    Field,
    Form,
    HStack,
    Radio,
    RadioGroup,
    Text,
    VStack,
} from '@vapor-ui/core';
import { ChevronDownOutlineIcon, RefreshOutlineIcon } from '@vapor-ui/icons';

// 초기값 정의
interface FormData {
    view: string;
    sort: {
        feedback: boolean;
        buttons: boolean;
        'data-display': boolean;
        overlay: boolean;
        inputs: boolean;
        navigation: boolean;
        utils: boolean;
    };
    packs: {
        'goorm-dev/vapor-core': boolean;
        'goorm-dev/vapor-component': boolean;
        'vapor-ui/core': boolean;
    };
    status: {
        active: boolean;
        inactive: boolean;
        draft: boolean;
    };
    tag: {
        ui: boolean;
        'open-source': boolean;
        performance: boolean;
    };
}

const DEFAULT_VALUES: FormData = {
    view: 'recent',
    sort: {
        feedback: false,
        buttons: false,
        'data-display': false,
        overlay: false,
        inputs: false,
        navigation: false,
        utils: false,
    },
    packs: {
        'goorm-dev/vapor-core': false,
        'goorm-dev/vapor-component': false,
        'vapor-ui/core': false,
    },
    status: { active: false, inactive: false, draft: false },
    tag: { ui: false, 'open-source': false, performance: false },
};

export default function FilterForm() {
    const { control, watch, reset, handleSubmit } = useForm<FormData>({
        defaultValues: DEFAULT_VALUES,
    });

    const sortValues = watch('sort');
    const selectedSortCount = Object.values(sortValues).filter(Boolean).length;

    const onSubmit = (data: FormData) => {
        console.log('Filter form submitted:', data);
    };

    const handleReset = () => {
        reset(DEFAULT_VALUES);
    };

    return (
        <VStack width="17.625rem" render={<Form onSubmit={handleSubmit(onSubmit)} />}>
            <HStack justifyContent="space-between">
                <Text typography="heading5">Filter</Text>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    colorPalette="secondary"
                    onClick={handleReset}
                >
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
                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">View</Text>

                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <Field.Root render={<Box marginTop="$150" />}>
                            <Controller
                                name="view"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup.Root
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <Box render={<Field.Label />} alignItems="center">
                                            <Radio.Root id="filter-recent" value="recent" />
                                            Recent
                                        </Box>
                                        <Box render={<Field.Label />} alignItems="center">
                                            <Radio.Root id="filter-popular" value="popular" />
                                            Most Popular
                                        </Box>
                                    </RadioGroup.Root>
                                )}
                            />
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">
                            Sort <Text foreground="primary-100">{selectedSortCount}</Text>
                        </Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <Field.Root render={<Box marginTop="$150" />}>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="sort.feedback"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-feedback"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Feedback
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="sort.buttons"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-buttons"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Buttons
                            </Box>
                        </Field.Root>

                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="sort.data-display"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-data-display"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Data Display
                            </Box>
                        </Field.Root>

                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="sort.overlay"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-overlay"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Overlay
                            </Box>
                        </Field.Root>

                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="sort.inputs"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-inputs"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Inputs
                            </Box>
                        </Field.Root>

                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="sort.navigation"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-navigation"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Navigation
                            </Box>
                        </Field.Root>

                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="sort.utils"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-utils"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Utils
                            </Box>
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Package</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <Field.Root render={<Box marginTop="$150" />}>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="packs.goorm-dev/vapor-core"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-goorm-dev/vapor-core"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                goorm-dev/vapor-core
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="packs.goorm-dev/vapor-component"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-goorm-dev/vapor-component"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                goorm-dev/vapor-component
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="packs.vapor-ui/core"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-vapor-ui/core"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                vapor-ui/core
                            </Box>
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Status</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <Field.Root render={<Box marginTop="$150" />}>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="status.active"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-active"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Active
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="status.inactive"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-inactive"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Inactive
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="status.draft"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-draft"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Draft
                            </Box>
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Tag</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <Field.Root render={<Box marginTop="$150" />}>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="tag.ui"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-ui"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                UI
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="tag.open-source"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-open-source"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Open Source
                            </Box>
                        </Field.Root>
                        <Field.Root>
                            <Box render={<Field.Label />} alignItems="center">
                                <Controller
                                    name="tag.performance"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Root
                                            id="filter-performance"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                Performance
                            </Box>
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>
        </VStack>
    );
}
