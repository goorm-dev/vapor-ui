import './filter-form.css';

import { useForm, useStore } from '@tanstack/react-form';

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
const FORM_SCHEME = {
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
    const form = useForm({
        defaultValues: FORM_SCHEME,
        onSubmit: async ({ value }) => {
            console.log('Form submitted:', value);
        },
    });

    const sortValues = useStore(form.store, (state) => state.values.sort);
    const selectedSortCount = Object.values(sortValues).filter(Boolean).length;

    const handleReset = () => {
        form.reset();
    };

    return (
        <VStack
            width="17.625rem"
            render={
                <Form
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
            <HStack justifyContent="space-between">
                <Text typography="heading5">Filter</Text>
                <Button type="reset" size="sm" variant="ghost" colorPalette="secondary">
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
                        <form.Field name="view">
                            {(field) => (
                                <Field.Root render={<Box marginTop="$150" />}>
                                    <RadioGroup.Root
                                        value={field.state.value}
                                        onValueChange={(value) =>
                                            field.handleChange(value as string)
                                        }
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
                                </Field.Root>
                            )}
                        </form.Field>
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
                        <form.Field name="sort.feedback">
                            {(field) => (
                                <Field.Root render={<Box marginTop="$150" />}>
                                    <Box render={<Field.Label />} alignItems="center">
                                        <Checkbox.Root
                                            id="filter-feedback"
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
                                            id="filter-buttons"
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
                                            id="filter-data-display"
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
                                            id="filter-overlay"
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
                                            id="filter-inputs"
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
                                            id="filter-navigation"
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
                                            id="filter-utils"
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
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Package</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <form.Field name="packs.goorm-dev/vapor-core">
                            {(field) => (
                                <Field.Root render={<Box marginTop="$150" />}>
                                    <Box render={<Field.Label />} alignItems="center">
                                        <Checkbox.Root
                                            id="filter-goorm-dev/vapor-core"
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
                                            id="filter-goorm-dev/vapor-component"
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
                                            id="filter-vapor-ui/core"
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
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Status</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <form.Field name="status.active">
                            {(field) => (
                                <Field.Root render={<Box marginTop="$150" />}>
                                    <Box render={<Field.Label />} alignItems="center">
                                        <Checkbox.Root
                                            id="filter-active"
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
                                            id="filter-inactive"
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
                                            id="filter-draft"
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
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Tag</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <form.Field name="tag.ui">
                            {(field) => (
                                <Field.Root render={<Box marginTop="$150" />}>
                                    <Box render={<Field.Label />} alignItems="center">
                                        <Checkbox.Root
                                            id="filter-ui"
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
                                            id="filter-open-source"
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
                                            id="filter-performance"
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
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>
        </VStack>
    );
}
