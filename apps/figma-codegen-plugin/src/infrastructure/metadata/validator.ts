/**
 * Metadata Validator
 *
 * component.metadata.json 스키마 검증
 */

import type { ComponentMetadata } from './types';

/**
 * 검증 결과
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * 메타데이터 검증
 *
 * @param metadata - 검증할 메타데이터
 * @returns 검증 결과
 */
export function validateMetadata(metadata: unknown): ValidationResult {
    const errors: string[] = [];

    // 기본 타입 체크
    if (!metadata || typeof metadata !== 'object') {
        errors.push('Metadata must be an object');
        return { valid: false, errors };
    }

    const meta = metadata as Partial<ComponentMetadata>;

    // Version 체크
    if (!meta.version || typeof meta.version !== 'string') {
        errors.push('Metadata must have a valid version string');
    }

    // Components 체크
    if (!meta.components || typeof meta.components !== 'object') {
        errors.push('Metadata must have a components object');
        return { valid: false, errors };
    }

    // 각 컴포넌트 규칙 검증
    for (const [componentName, rule] of Object.entries(meta.components)) {
        if (!rule || typeof rule !== 'object') {
            errors.push(`Component '${componentName}' must be an object`);
            continue;
        }

        // name 필드 체크
        if (!rule.name || typeof rule.name !== 'string') {
            errors.push(`Component '${componentName}' must have a name field`);
        }

        // variants 검증 (optional)
        if (rule.variants) {
            if (!Array.isArray(rule.variants)) {
                errors.push(`Component '${componentName}' variants must be an array`);
            } else {
                rule.variants.forEach((variant, index) => {
                    if (!variant.figmaProperty || !variant.propName) {
                        errors.push(
                            `Component '${componentName}' variant[${index}] must have figmaProperty and propName`,
                        );
                    }
                });
            }
        }

        // augmentations 검증 (optional)
        if (rule.augmentations) {
            if (!Array.isArray(rule.augmentations)) {
                errors.push(`Component '${componentName}' augmentations must be an array`);
            } else {
                rule.augmentations.forEach((aug, index) => {
                    if (!aug.name || !aug.type || !aug.target) {
                        errors.push(
                            `Component '${componentName}' augmentation[${index}] must have name, type, and target`,
                        );
                    }
                });
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
