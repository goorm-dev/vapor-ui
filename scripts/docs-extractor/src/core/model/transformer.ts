/**
 * Model transformer: Parsed → Domain Model
 *
 * Converts parser output into normalized domain models.
 * Classification, sorting, and related domain rules are applied here.
 */
import { CATEGORY_ORDER, COMPOSITION_PROPS, STATE_PROP_PATTERNS } from '~/core/model/constants';
import type { ParsedComponent, ParsedProp } from '~/core/parser/types';

import type { ComponentModel, PropCategory, PropModel } from './types';

// ============================================================
// Source & Category Classification
// ============================================================

type SourceKind = 'base-ui' | 'custom' | 'variants';

function getSourceFromPath(filePath?: string): SourceKind {
    if (!filePath) return 'custom';
    if (filePath.includes('@base-ui')) return 'base-ui';
    if (filePath.endsWith('.css.ts')) return 'variants';
    return 'custom';
}

function isStateProp(name: string): boolean {
    return STATE_PROP_PATTERNS.some((pattern) => pattern.test(name));
}

function isCompositionProp(name: string): boolean {
    return COMPOSITION_PROPS.has(name);
}

function getCategory(name: string, required: boolean, source: SourceKind): PropCategory {
    if (required) return 'required';
    if (isCompositionProp(name)) return 'composition';
    if (source === 'variants') return 'variants';
    if (isStateProp(name)) return 'state';
    if (source === 'base-ui') return 'base-ui';
    return 'custom';
}

// ============================================================
// Type Normalization
// ============================================================

/**
 * Check if a type part is simple (should be split) vs complex (keep as single string)
 */
function isSimpleType(part: string): boolean {
    // String literals: "circle", 'square'
    if (/^["'].*["']$/.test(part)) return true;

    // Numbers: 123
    if (/^\d+$/.test(part)) return true;

    // Simple identifiers: circle, $primary-100, null, number, string
    // Allows: letters, numbers, $, -, _ (no complex type chars)
    if (/^[\w$-]+$/.test(part)) return true;

    return false;
}

function parseTypeString(typeString: string): string[] {
    // Union type을 배열로 분리: "a" | "b" | "c" → ["a", "b", "c"]
    // 단순 타입은 그대로: "string" → ["string"]

    if (typeString.includes(' | ')) {
        const parts = typeString.split(' | ').map((s) => s.trim());
        // 모든 part가 단순 타입인 경우만 분리
        if (parts.every(isSimpleType)) {
            return parts;
        }
    }

    return [typeString];
}

// ============================================================
// Transformers
// ============================================================

export function parsedPropToModel(parsedProp: ParsedProp): PropModel {
    const source = getSourceFromPath(parsedProp.declarationFilePath);
    const required = !parsedProp.isOptional;

    return {
        name: parsedProp.name,
        types: parseTypeString(parsedProp.typeString),
        required,
        description: parsedProp.description,
        defaultValue: parsedProp.defaultValue,
        category: getCategory(parsedProp.name, required, source),
    };
}

export function parsedComponentToModel(parsedComponent: ParsedComponent): ComponentModel {
    const propModels = parsedComponent.props.map(parsedPropToModel);
    const sortedProps = sortPropModels(propModels);

    return {
        name: parsedComponent.name,
        displayName: parsedComponent.name,
        description: parsedComponent.description,
        props: sortedProps,
    };
}

// ============================================================
// Sorting
// ============================================================

function sortPropModels(props: PropModel[]): PropModel[] {
    return [...props].sort((a, b) => {
        const categoryOrder = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
        if (categoryOrder !== 0) return categoryOrder;
        return a.name.localeCompare(b.name);
    });
}
