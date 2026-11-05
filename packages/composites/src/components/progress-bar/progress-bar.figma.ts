// url=https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=2701-9104&m=dev
// source=src/components/progress-bar/progress-bar.tsx
// component=ProgressBar
import figma from 'figma';

import { findChild, getProperties } from '../../utils/figma-utils';

type ValueDisplay =
    | { kind: 'indeterminate' }
    | { kind: 'hidden'; value: number }
    | { kind: 'percent'; value: number }
    | { kind: 'ratio'; value: number; max: number };

const BOOLEAN_VARIANT = { true: true, false: false };

const instance = figma.selectedInstance;

function parseNumber(text: string | undefined, fallback: number) {
    const parsed = parseFloat(text ?? '');
    return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveValueDisplay(): ValueDisplay {
    if (instance.getEnum('(indeterminate)', BOOLEAN_VARIANT)) return { kind: 'indeterminate' };

    const valueText = findChild(instance, '(valueText)');
    if (!valueText) return { kind: 'hidden', value: 50 };

    const value = parseNumber(valueText.getString('value'), 50);
    if (!valueText.getEnum('max value', BOOLEAN_VARIANT)) return { kind: 'percent', value };

    return { kind: 'ratio', value, max: parseNumber(valueText.getString('max value'), 100) };
}

function renderValueProps(display: ValueDisplay) {
    switch (display.kind) {
        case 'indeterminate':
            return { value: figma.code`value={null}`, max: '', valueText: '' };
        case 'hidden':
            return { value: figma.code`value={${display.value}}`, max: '', valueText: '' };
        case 'percent':
            return {
                value: figma.code`value={${display.value}}`,
                max: '',
                valueText: figma.code`valueText={(formattedValue) => formattedValue}`,
            };
        case 'ratio':
            return {
                value: figma.code`value={${display.value}}`,
                max: figma.code`max={${display.max}}`,
                valueText: figma.code`valueText={(_, value) => \`\${value} / ${display.max}\`}`,
            };
    }
}

const valueProps = renderValueProps(resolveValueDisplay());

const root = getProperties(instance, null, {
    size: { kind: 'enum', name: 'size', options: { sm: 'sm', md: 'md', lg: 'lg' } },
    type: { kind: 'enum', name: 'type', options: { default: 'default', error: 'error' } },
});

const label = getProperties(instance, '(label)', {
    label: { kind: 'string', name: 'label' },
});

const description = getProperties(instance, '(description)', {
    description: { kind: 'string', name: 'description' },
});

const labelComment = instance.getBoolean('(has text area)')
    ? ''
    : figma.code`// 텍스트 영역이 숨겨져 있어도 label은 접근 가능한 이름이므로 지정하세요.`;

export default {
    example: figma.code`
        <ProgressBar
            ${valueProps.value}
            ${valueProps.max}
            ${root.size}
            ${root.type}
            ${labelComment}
            ${label.label}
            ${valueProps.valueText}
            ${description.description}
        />
    `,
    imports: ['import { ProgressBar } from "@vapor-ui/composites"'],
    id: 'progress-bar',
    metadata: { nestable: false },
};
