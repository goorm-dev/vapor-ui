import './sheet-form.css';

import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';

import { Button, Checkbox, Field, Form, Sheet, Tabs, VStack } from '@vapor-ui/core';
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
            className="sheet-form"
            render={<Form id="sheet-form" onReset={handleReset} />}
            $css={{
                gap: '$250',
                width: '100%',
                padding: '$300',
                borderRadius: '$300',
                border: '1px solid #eee',
            }}
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
                                <Tabs.Button value="sort">Sort</Tabs.Button>
                                <Tabs.Button value="package">Package</Tabs.Button>
                                <Tabs.Button value="status">Status</Tabs.Button>
                                <Tabs.Button value="tag">Tag</Tabs.Button>
                            </Tabs.List>
                            <Tabs.Panel value="sort" className={'tabs-panel'}>
                                <VStack $css={{ gap: '$100' }}>
                                    {/* Sort */}
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-feedback"
                                                size="lg"
                                                checked={getFieldValues('sort').feedback}
                                                onCheckedChange={handleCheckboxChange(
                                                    'sort',
                                                    'feedback',
                                                )}
                                            />
                                            <Field.Label>Feedback</Field.Label>
                                        </Field.Item>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-buttons"
                                                size="lg"
                                                checked={getFieldValues('sort').buttons}
                                                onCheckedChange={handleCheckboxChange(
                                                    'sort',
                                                    'buttons',
                                                )}
                                            />
                                            <Field.Label>Buttons</Field.Label>
                                        </Field.Item>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-data-display"
                                                size="lg"
                                                checked={getFieldValues('sort')['data-display']}
                                                onCheckedChange={handleCheckboxChange(
                                                    'sort',
                                                    'data-display',
                                                )}
                                            />
                                            <Field.Label>Data Display</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-overlay"
                                                size="lg"
                                                checked={getFieldValues('sort').overlay}
                                                onCheckedChange={handleCheckboxChange(
                                                    'sort',
                                                    'overlay',
                                                )}
                                            />
                                            <Field.Label>Overlay</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-inputs"
                                                size="lg"
                                                checked={getFieldValues('sort').inputs}
                                                onCheckedChange={handleCheckboxChange(
                                                    'sort',
                                                    'inputs',
                                                )}
                                            />
                                            <Field.Label>Inputs</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-navigation"
                                                size="lg"
                                                checked={getFieldValues('sort').navigation}
                                                onCheckedChange={handleCheckboxChange(
                                                    'sort',
                                                    'navigation',
                                                )}
                                            />
                                            <Field.Label>Navigation</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-utils"
                                                size="lg"
                                                checked={getFieldValues('sort').utils}
                                                onCheckedChange={handleCheckboxChange(
                                                    'sort',
                                                    'utils',
                                                )}
                                            />
                                            <Field.Label>Utils</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                </VStack>
                            </Tabs.Panel>
                            {/* Package */}
                            <Tabs.Panel value="package" className={'tabs-panel'}>
                                <VStack $css={{ gap: '$100' }}>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-goorm-dev/vapor-core"
                                                size="lg"
                                                checked={
                                                    getFieldValues('packs')['goorm-dev/vapor-core']
                                                }
                                                onCheckedChange={handleCheckboxChange(
                                                    'packs',
                                                    'goorm-dev/vapor-core',
                                                )}
                                            />
                                            <Field.Label>goorm-dev/vapor-core</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Item>
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
                                            <Field.Label>goorm-dev/vapor-component</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-vapor-ui/core"
                                                size="lg"
                                                checked={getFieldValues('packs')['vapor-ui/core']}
                                                onCheckedChange={handleCheckboxChange(
                                                    'packs',
                                                    'vapor-ui/core',
                                                )}
                                            />
                                            <Field.Label>vapor-ui/core</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                </VStack>
                            </Tabs.Panel>
                            {/* Status */}
                            <Tabs.Panel value="status" className={'tabs-panel'}>
                                <VStack $css={{ gap: '$100' }}>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-active"
                                                size="lg"
                                                checked={getFieldValues('status').active}
                                                onCheckedChange={handleCheckboxChange(
                                                    'status',
                                                    'active',
                                                )}
                                            />
                                            <Field.Label>Active</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-inactive"
                                                size="lg"
                                                checked={getFieldValues('status').inactive}
                                                onCheckedChange={handleCheckboxChange(
                                                    'status',
                                                    'inactive',
                                                )}
                                            />
                                            <Field.Label>Inactive</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-draft"
                                                size="lg"
                                                checked={getFieldValues('status').draft}
                                                onCheckedChange={handleCheckboxChange(
                                                    'status',
                                                    'draft',
                                                )}
                                            />
                                            <Field.Label>Draft</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
                                </VStack>
                            </Tabs.Panel>
                            {/* Tag */}
                            <Tabs.Panel value="tag" className={'tabs-panel'}>
                                <VStack $css={{ gap: '$100' }}>
                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-ui"
                                                size="lg"
                                                checked={getFieldValues('tag').ui}
                                                onCheckedChange={handleCheckboxChange('tag', 'ui')}
                                            />
                                            <Field.Label>UI</Field.Label>
                                        </Field.Item>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-open-source"
                                                size="lg"
                                                checked={getFieldValues('tag')['open-source']}
                                                onCheckedChange={handleCheckboxChange(
                                                    'tag',
                                                    'open-source',
                                                )}
                                            />
                                            <Field.Label>Open Source</Field.Label>
                                        </Field.Item>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Item>
                                            <Checkbox.Root
                                                id="sheet-performance"
                                                size="lg"
                                                checked={getFieldValues('tag').performance}
                                                onCheckedChange={handleCheckboxChange(
                                                    'tag',
                                                    'performance',
                                                )}
                                            />
                                            <Field.Label>Performance</Field.Label>
                                        </Field.Item>
                                    </Field.Root>
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
