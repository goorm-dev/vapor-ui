import './filter-form.css';

import type { FormEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

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
type FormData = typeof FORM_SCHEME;

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
    const formRef = useRef<HTMLFormElement>(null);
    const [formData, setFormData] = useState<FormData>({
        view: FORM_SCHEME.view,
        sort: { ...FORM_SCHEME.sort },
        packs: { ...FORM_SCHEME.packs },
        status: { ...FORM_SCHEME.status },
        tag: { ...FORM_SCHEME.tag },
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

    // 라디오 버튼 변경 핸들러
    const handleRadioChange = useCallback((fieldName: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
    }, []);

    // 체크박스 변경 핸들러
    const handleCheckboxChange = useCallback(
        (fieldName: keyof FormData, key: string) => (checked: boolean) => {
            updateFormData(fieldName, key, checked);
        },
        [updateFormData],
    );

    const selectedSortCount = Object.values(getFieldValues('sort')).filter(Boolean).length;

    const handleReset = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setFormData({
            view: FORM_SCHEME.view,
            sort: { ...FORM_SCHEME.sort },
            packs: { ...FORM_SCHEME.packs },
            status: { ...FORM_SCHEME.status },
            tag: { ...FORM_SCHEME.tag },
        });
    };

    return (
        <VStack
            width="17.625rem"
            className="filter"
            render={<Form ref={formRef} onReset={handleReset} />}
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
                        <Field.Root render={<Box marginTop="$150" />}>
                            <RadioGroup.Root
                                value={getFieldValues('view')}
                                onValueChange={(value: unknown) =>
                                    handleRadioChange('view', value as string)
                                }
                            >
                                <HStack
                                    render={<Field.Label />}
                                    gap="$100"
                                    alignItems="center"
                                    className="radio-label"
                                >
                                    <Radio.Root id="filter-recent" value="recent" />
                                    Recent
                                </HStack>
                                <HStack
                                    render={<Field.Label />}
                                    gap="$100"
                                    alignItems="center"
                                    className="radio-label"
                                >
                                    <Radio.Root id="filter-popular" value="popular" />
                                    Most Popular
                                </HStack>
                            </RadioGroup.Root>
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
                        <Field.Root
                            render={<HStack alignItems="center" gap="$100" marginTop="$150" />}
                        >
                            <Checkbox.Root
                                id="filter-feedback"
                                checked={getFieldValues('sort').feedback}
                                onCheckedChange={handleCheckboxChange('sort', 'feedback')}
                            />
                            <Field.Label className="checkbox-label">Feedback</Field.Label>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-buttons"
                                checked={getFieldValues('sort').buttons}
                                onCheckedChange={handleCheckboxChange('sort', 'buttons')}
                            />
                            <Field.Label className="checkbox-label">Buttons</Field.Label>
                        </Field.Root>

                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-data-display"
                                checked={getFieldValues('sort')['data-display']}
                                onCheckedChange={handleCheckboxChange('sort', 'data-display')}
                            />
                            <Field.Label className="checkbox-label">Data Display</Field.Label>
                        </Field.Root>

                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-overlay"
                                checked={getFieldValues('sort').overlay}
                                onCheckedChange={handleCheckboxChange('sort', 'overlay')}
                            />
                            <Field.Label className="checkbox-label">Overlay</Field.Label>
                        </Field.Root>

                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-inputs"
                                checked={getFieldValues('sort').inputs}
                                onCheckedChange={handleCheckboxChange('sort', 'inputs')}
                            />
                            <Field.Label className="checkbox-label">Inputs</Field.Label>
                        </Field.Root>

                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-navigation"
                                checked={getFieldValues('sort').navigation}
                                onCheckedChange={handleCheckboxChange('sort', 'navigation')}
                            />
                            <Field.Label className="checkbox-label">Navigation</Field.Label>
                        </Field.Root>

                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-utils"
                                checked={getFieldValues('sort').utils}
                                onCheckedChange={handleCheckboxChange('sort', 'utils')}
                            />
                            <Field.Label className="checkbox-label">Utils</Field.Label>
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Package</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <Field.Root
                            render={<HStack alignItems="center" gap="$100" marginTop="$150" />}
                        >
                            <Checkbox.Root
                                id="filter-goorm-dev/vapor-core"
                                checked={getFieldValues('packs')['goorm-dev/vapor-core']}
                                onCheckedChange={handleCheckboxChange(
                                    'packs',
                                    'goorm-dev/vapor-core',
                                )}
                            />
                            <Field.Label className="checkbox-label">
                                goorm-dev/vapor-core
                            </Field.Label>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-goorm-dev/vapor-component"
                                checked={getFieldValues('packs')['goorm-dev/vapor-component']}
                                onCheckedChange={handleCheckboxChange(
                                    'packs',
                                    'goorm-dev/vapor-component',
                                )}
                            />
                            <Field.Label className="checkbox-label">
                                goorm-dev/vapor-component
                            </Field.Label>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-vapor-ui/core"
                                checked={getFieldValues('packs')['vapor-ui/core']}
                                onCheckedChange={handleCheckboxChange('packs', 'vapor-ui/core')}
                            />
                            <Field.Label className="checkbox-label">vapor-ui/core</Field.Label>
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Status</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <Field.Root
                            render={<HStack alignItems="center" gap="$100" marginTop="$150" />}
                        >
                            <Checkbox.Root
                                id="filter-active"
                                checked={getFieldValues('status').active}
                                onCheckedChange={handleCheckboxChange('status', 'active')}
                            />
                            <Field.Label className="checkbox-label">Active</Field.Label>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-inactive"
                                checked={getFieldValues('status').inactive}
                                onCheckedChange={handleCheckboxChange('status', 'inactive')}
                            />
                            <Field.Label className="checkbox-label">Inactive</Field.Label>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-draft"
                                checked={getFieldValues('status').draft}
                                onCheckedChange={handleCheckboxChange('status', 'draft')}
                            />
                            <Field.Label className="checkbox-label">Draft</Field.Label>
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>

                <Collapsible.Root>
                    <Collapsible.Trigger className="collapsible-trigger">
                        <Text typography="heading6">Tag</Text>
                        <ChevronDownOutlineIcon className="trigger-icon" />
                    </Collapsible.Trigger>

                    <Collapsible.Panel>
                        <Field.Root
                            render={<HStack alignItems="center" gap="$100" marginTop="$150" />}
                        >
                            <Checkbox.Root
                                id="filter-ui"
                                checked={getFieldValues('tag').ui}
                                onCheckedChange={handleCheckboxChange('tag', 'ui')}
                            />
                            <Field.Label className="checkbox-label">UI</Field.Label>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-open-source"
                                checked={getFieldValues('tag')['open-source']}
                                onCheckedChange={handleCheckboxChange('tag', 'open-source')}
                            />
                            <Field.Label className="checkbox-label">Open Source</Field.Label>
                        </Field.Root>
                        <Field.Root render={<HStack alignItems="center" gap="$100" />}>
                            <Checkbox.Root
                                id="filter-performance"
                                checked={getFieldValues('tag').performance}
                                onCheckedChange={handleCheckboxChange('tag', 'performance')}
                            />
                            <Field.Label className="checkbox-label">Performance</Field.Label>
                        </Field.Root>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>
        </VStack>
    );
}
