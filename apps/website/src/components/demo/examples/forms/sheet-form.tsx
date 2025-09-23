import './sheet-form.css';

import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';

import { Button, Checkbox, Field, Form, HStack, Sheet, Tabs, VStack } from '@vapor-ui/core';
import { RefreshOutlineIcon } from '@vapor-ui/icons';

type FormData = typeof FORM_SCHEME;

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
    const [formData, setFormData] = useState<FormData>(() => {
        return {
            sort: { ...FORM_SCHEME.sort },
            packs: { ...FORM_SCHEME.packs },
            status: { ...FORM_SCHEME.status },
            tag: { ...FORM_SCHEME.tag },
        };
    });

    const getFieldValues = useCallback(
        <T extends keyof FormData>(fieldName: T): FormData[T] => formData[fieldName],
        [formData],
    );

    const updateFormData = useCallback(
        (fieldName: keyof FormData, key: string, checked: boolean) => {
            setFormData((prev) => {
                const field = prev[fieldName];

                if (typeof field !== 'object') return prev;

                return { ...prev, [fieldName]: { ...field, [key]: checked } };
            });
        },
        [],
    );

    const handleCheckboxChange = useCallback(
        (fieldName: keyof FormData, key: string) => (checked: boolean) => {
            updateFormData(fieldName, key, checked);
        },
        [updateFormData],
    );

    const handleReset = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setFormData({
            sort: { ...FORM_SCHEME.sort },
            packs: { ...FORM_SCHEME.packs },
            status: { ...FORM_SCHEME.status },
            tag: { ...FORM_SCHEME.tag },
        });
    }, []);

    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid #eee"
            className="sheet-form"
            render={<Form id="sheet-form" onReset={handleReset} />}
        >
            <Sheet.Root>
                <Sheet.Trigger render={<Button />}>Open Filter</Sheet.Trigger>
                <Sheet.Portal>
                    <Sheet.Overlay />
                    <Sheet.Positioner side="bottom">
                        <Sheet.Popup className={'popup'}>
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
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-feedback"
                                                    size="lg"
                                                    checked={getFieldValues('sort').feedback}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'sort',
                                                        'feedback',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Feedback
                                                </Field.Label>
                                            </Field.Root>

                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-buttons"
                                                    size="lg"
                                                    checked={getFieldValues('sort').buttons}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'sort',
                                                        'buttons',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Buttons
                                                </Field.Label>
                                            </Field.Root>

                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-data-display"
                                                    size="lg"
                                                    checked={getFieldValues('sort')['data-display']}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'sort',
                                                        'data-display',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Data Display
                                                </Field.Label>
                                            </Field.Root>
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-overlay"
                                                    size="lg"
                                                    checked={getFieldValues('sort').overlay}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'sort',
                                                        'overlay',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Overlay
                                                </Field.Label>
                                            </Field.Root>
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-inputs"
                                                    size="lg"
                                                    checked={getFieldValues('sort').inputs}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'sort',
                                                        'inputs',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Inputs
                                                </Field.Label>
                                            </Field.Root>
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-navigation"
                                                    size="lg"
                                                    checked={getFieldValues('sort').navigation}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'sort',
                                                        'navigation',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Navigation
                                                </Field.Label>
                                            </Field.Root>
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-utils"
                                                    size="lg"
                                                    checked={getFieldValues('sort').utils}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'sort',
                                                        'utils',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Utils
                                                </Field.Label>
                                            </Field.Root>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Package */}
                                    <Tabs.Panel value="package" className={'tabs-panel'}>
                                        <VStack gap="$100">
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-goorm-dev/vapor-core"
                                                    size="lg"
                                                    checked={
                                                        getFieldValues('packs')[
                                                            'goorm-dev/vapor-core'
                                                        ]
                                                    }
                                                    onCheckedChange={handleCheckboxChange(
                                                        'packs',
                                                        'goorm-dev/vapor-core',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    goorm-dev/vapor-core
                                                </Field.Label>
                                            </Field.Root>
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-goorm-dev/vapor-component"
                                                    size="lg"
                                                    checked={
                                                        getFieldValues('packs')[
                                                            'goorm-dev/vapor-component'
                                                        ]
                                                    }
                                                    onCheckedChange={handleCheckboxChange(
                                                        'packs',
                                                        'goorm-dev/vapor-component',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    goorm-dev/vapor-component
                                                </Field.Label>
                                            </Field.Root>
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-vapor-ui/core"
                                                    size="lg"
                                                    checked={
                                                        getFieldValues('packs')['vapor-ui/core']
                                                    }
                                                    onCheckedChange={handleCheckboxChange(
                                                        'packs',
                                                        'vapor-ui/core',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    vapor-ui/core
                                                </Field.Label>
                                            </Field.Root>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Status */}
                                    <Tabs.Panel value="status" className={'tabs-panel'}>
                                        <VStack gap="$100">
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-active"
                                                    size="lg"
                                                    checked={getFieldValues('status').active}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'status',
                                                        'active',
                                                    )}
                                                />
                                                <Field.Label className={'checkbox-label'}>
                                                    Active
                                                </Field.Label>
                                            </Field.Root>
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-inactive"
                                                    size="lg"
                                                    checked={getFieldValues('status').inactive}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'status',
                                                        'inactive',
                                                    )}
                                                />
                                                <Field.Label className={'checkbox-label'}>
                                                    Inactive
                                                </Field.Label>
                                            </Field.Root>
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-draft"
                                                    size="lg"
                                                    checked={getFieldValues('status').draft}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'status',
                                                        'draft',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Draft
                                                </Field.Label>
                                            </Field.Root>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Tag */}
                                    <Tabs.Panel value="tag" className={'tabs-panel'}>
                                        <VStack gap="$100">
                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-react"
                                                    size="lg"
                                                    checked={getFieldValues('tag').ui}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'tag',
                                                        'ui',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    UI
                                                </Field.Label>
                                            </Field.Root>

                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-open-source"
                                                    size="lg"
                                                    checked={getFieldValues('tag')['open-source']}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'tag',
                                                        'open-source',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Open Source
                                                </Field.Label>
                                            </Field.Root>

                                            <Field.Root
                                                render={<HStack alignItems="center" gap="$100" />}
                                            >
                                                <Checkbox.Root
                                                    id="sheet-performance"
                                                    size="lg"
                                                    checked={getFieldValues('tag').performance}
                                                    onCheckedChange={handleCheckboxChange(
                                                        'tag',
                                                        'performance',
                                                    )}
                                                />
                                                <Field.Label className="checkbox-label">
                                                    Performance
                                                </Field.Label>
                                            </Field.Root>
                                        </VStack>
                                    </Tabs.Panel>
                                </Tabs.Root>
                            </Sheet.Body>
                            <Sheet.Footer className="footer">
                                <Button
                                    type="reset"
                                    size="lg"
                                    color="secondary"
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
                    </Sheet.Positioner>
                </Sheet.Portal>
            </Sheet.Root>
        </VStack>
    );
}
