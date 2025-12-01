import './sheet-form.css';

import { useForm } from '@tanstack/react-form';

import { Box, Button, Checkbox, Field, Form, Sheet, Tabs, VStack } from '@vapor-ui/core';
import { RefreshOutlineIcon } from '@vapor-ui/icons';

const FORM_SCHEME = {
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
    const form = useForm({
        defaultValues: FORM_SCHEME,
        onSubmit: async ({ value }) => {
            console.log('Form submitted:', value);
        },
    });

    const handleReset = () => {
        form.reset();
    };

    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid #eee"
            className="sheet-form"
            render={
                <Form
                    id="sheet-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    onReset={(e) => {
                        e.preventDefault();
                        handleReset();
                    }}
                />
            }
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
                                    <form.Field name="sort.feedback">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-feedback"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Feedback
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>

                                    <form.Field name="sort.buttons">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-buttons"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Buttons
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>

                                    <form.Field name="sort.data-display">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-data-display"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Data Display
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                    <form.Field name="sort.overlay">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-overlay"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Overlay
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                    <form.Field name="sort.inputs">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-inputs"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Inputs
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                    <form.Field name="sort.navigation">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-navigation"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Navigation
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                    <form.Field name="sort.utils">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-utils"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Utils
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                </VStack>
                            </Tabs.Panel>
                            {/* Package */}
                            <Tabs.Panel value="package" className={'tabs-panel'}>
                                <VStack gap="$100">
                                    <form.Field name="packs.goorm-dev/vapor-core">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-goorm-dev/vapor-core"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    goorm-dev/vapor-core
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                    <form.Field name="packs.goorm-dev/vapor-component">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-goorm-dev/vapor-component"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    goorm-dev/vapor-component
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                    <form.Field name="packs.vapor-ui/core">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-vapor-ui/core"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    vapor-ui/core
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                </VStack>
                            </Tabs.Panel>
                            {/* Status */}
                            <Tabs.Panel value="status" className={'tabs-panel'}>
                                <VStack gap="$100">
                                    <form.Field name="status.active">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-active"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Active
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                    <form.Field name="status.inactive">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-inactive"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Inactive
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                    <form.Field name="status.draft">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-draft"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Draft
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                </VStack>
                            </Tabs.Panel>
                            {/* Tag */}
                            <Tabs.Panel value="tag" className={'tabs-panel'}>
                                <VStack gap="$100">
                                    <form.Field name="tag.ui">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-ui"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    UI
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>

                                    <form.Field name="tag.open-source">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-open-source"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Open Source
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>

                                    <form.Field name="tag.performance">
                                        {(field) => (
                                            <Field.Root>
                                                <Box render={<Field.Label />} alignItems="center">
                                                    <Checkbox.Root
                                                        id="sheet-performance"
                                                        size="lg"
                                                        checked={field.state.value}
                                                        onCheckedChange={(checked) =>
                                                            field.handleChange(checked === true)
                                                        }
                                                    />
                                                    Performance
                                                </Box>
                                            </Field.Root>
                                        )}
                                    </form.Field>
                                </VStack>
                            </Tabs.Panel>
                        </Tabs.Root>
                    </Sheet.Body>
                    <Sheet.Footer className="footer">
                        <Button
                            type="reset"
                            size="lg"
                            colorPalette="secondary"
                            className="refresh-button"
                            form="sheet-form"
                        >
                            <RefreshOutlineIcon />
                            Refresh
                        </Button>
                        <Sheet.Close render={<Button size="lg" className="apply-button" />}>
                            Apply
                        </Sheet.Close>
                    </Sheet.Footer>
                </Sheet.Popup>
            </Sheet.Root>
        </VStack>
    );
}
