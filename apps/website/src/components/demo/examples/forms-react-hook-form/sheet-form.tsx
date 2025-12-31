import './sheet-form.css';

import { Controller, useForm } from 'react-hook-form';

import { Box, Button, Checkbox, Field, Form, Sheet, Tabs, VStack } from '@vapor-ui/core';
import { RefreshOutlineIcon } from '@vapor-ui/icons';

interface FormData {
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
    sort: {
        feedback: false,
        buttons: true,
        'data-display': false,
        overlay: false,
        inputs: true,
        navigation: false,
        utils: false,
    },
    packs: {
        'goorm-dev/vapor-core': true,
        'goorm-dev/vapor-component': false,
        'vapor-ui/core': false,
    },
    status: {
        active: true,
        inactive: false,
        draft: false,
    },
    tag: {
        ui: true,
        'open-source': false,
        performance: false,
    },
};

export default function SheetForm() {
    const { control, reset, handleSubmit } = useForm<FormData>({
        defaultValues: DEFAULT_VALUES,
    });

    const onSubmit = (data: FormData) => {
        console.log('Sheet form submitted:', data);
    };

    const handleReset = () => {
        reset(DEFAULT_VALUES);
    };

    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid #eee"
            className="sheet-form"
            render={<Form id="sheet-form" onSubmit={handleSubmit(onSubmit)} />}
        >
            <Sheet.Root>
                <Sheet.Trigger render={<Button />}>Open Filter</Sheet.Trigger>

                <Sheet.Popup
                    positionerElement={<Sheet.PositionerPrimitive side="bottom" />}
                    className={'popup'}
                >
                    <Sheet.Header className="header">
                        <Sheet.Title>Filter</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body className="body">
                        <Tabs.Root defaultValue={'sort'} className={'tabs'}>
                            <Tabs.List className={'tabs-list'}>
                                <Tabs.Trigger value="sort">Sort</Tabs.Trigger>
                                <Tabs.Trigger value="package">Package</Tabs.Trigger>
                                <Tabs.Trigger value="status">Status</Tabs.Trigger>
                                <Tabs.Trigger value="tag">Tag</Tabs.Trigger>
                                <Tabs.Indicator />
                            </Tabs.List>
                            <Tabs.Panel value="sort" className={'tabs-panel'}>
                                <VStack gap="$100">
                                    {/* Sort */}
                                    <Field.Root>
                                        <Box render={<Field.Label />} alignItems="center">
                                            <Controller
                                                name="sort.feedback"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox.Root
                                                        id="sheet-feedback"
                                                        size="lg"
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
                                                        id="sheet-buttons"
                                                        size="lg"
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
                                                        id="sheet-data-display"
                                                        size="lg"
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
                                                        id="sheet-overlay"
                                                        size="lg"
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
                                                        id="sheet-inputs"
                                                        size="lg"
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
                                                        id="sheet-navigation"
                                                        size="lg"
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
                                                        id="sheet-utils"
                                                        size="lg"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            Utils
                                        </Box>
                                    </Field.Root>
                                </VStack>
                            </Tabs.Panel>
                            {/* Package */}
                            <Tabs.Panel value="package" className={'tabs-panel'}>
                                <VStack gap="$100">
                                    <Field.Root>
                                        <Box render={<Field.Label />} alignItems="center">
                                            <Controller
                                                name="packs.goorm-dev/vapor-core"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox.Root
                                                        id="sheet-goorm-dev/vapor-core"
                                                        size="lg"
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
                                                        id="sheet-goorm-dev/vapor-component"
                                                        size="lg"
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
                                                        id="sheet-vapor-ui/core"
                                                        size="lg"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            vapor-ui/core
                                        </Box>
                                    </Field.Root>
                                </VStack>
                            </Tabs.Panel>
                            {/* Status */}
                            <Tabs.Panel value="status" className={'tabs-panel'}>
                                <VStack gap="$100">
                                    <Field.Root>
                                        <Box render={<Field.Label />} alignItems="center">
                                            <Controller
                                                name="status.active"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox.Root
                                                        id="sheet-active"
                                                        size="lg"
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
                                                        id="sheet-inactive"
                                                        size="lg"
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
                                                        id="sheet-draft"
                                                        size="lg"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            Draft
                                        </Box>
                                    </Field.Root>
                                </VStack>
                            </Tabs.Panel>
                            {/* Tag */}
                            <Tabs.Panel value="tag" className={'tabs-panel'}>
                                <VStack gap="$100">
                                    <Field.Root>
                                        <Box render={<Field.Label />} alignItems="center">
                                            <Controller
                                                name="tag.ui"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox.Root
                                                        id="sheet-ui"
                                                        size="lg"
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
                                                        id="sheet-open-source"
                                                        size="lg"
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
                                                        id="sheet-performance"
                                                        size="lg"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            Performance
                                        </Box>
                                    </Field.Root>
                                </VStack>
                            </Tabs.Panel>
                        </Tabs.Root>
                    </Sheet.Body>
                    <Sheet.Footer className="footer">
                        <Button
                            type="button"
                            size="lg"
                            colorPalette="secondary"
                            className="refresh-button"
                            onClick={handleReset}
                        >
                            <RefreshOutlineIcon />
                            Refresh
                        </Button>
                        <Sheet.Close
                            render={<Button type="submit" size="lg" className="apply-button" />}
                        >
                            Apply
                        </Sheet.Close>
                    </Sheet.Footer>
                </Sheet.Popup>
            </Sheet.Root>
        </VStack>
    );
}
