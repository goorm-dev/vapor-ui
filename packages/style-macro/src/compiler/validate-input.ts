import { classifyCondition } from '~/model/condition';
import { resolveToken } from '~/model/tokens';
import type { BuildError, ManifestShape } from '~/model/types';

import type { RawEntry, RawValue } from './parse-call';

function validateValue(
    property: string,
    raw: RawValue,
    manifest: ManifestShape,
    errors: BuildError[],
    allowTernary: boolean,
): void {
    switch (raw.kind) {
        case 'literal':
            return;
        case 'token': {
            const res = resolveToken(manifest, property, raw.token!);
            if ('error' in res) {
                errors.push({
                    code: res.error,
                    message:
                        res.error === 'unknown-token'
                            ? `Unknown token "$${raw.token}" for property "${property}".`
                            : res.error === 'scope-mismatch'
                              ? `Token "$${raw.token}" exists but is not valid for property "${property}".`
                              : `Property "${property}" has no token scope defined.`,
                    loc: raw.loc,
                });
            }
            return;
        }
        case 'ternary':
            if (!allowTernary) {
                errors.push({
                    code: 'dynamic-value',
                    message:
                        'Ternary is only allowed at entry-level. Move it outside the { default, sm, _hover } object.',
                    loc: raw.loc,
                });
                return;
            }
            validateValue(property, raw.consequent!, manifest, errors, false);
            validateValue(property, raw.alternate!, manifest, errors, false);
            return;
        case 'unknown':
            errors.push({
                code: 'dynamic-value',
                message: `Value for "${property}" must be a literal, token, or entry-level ternary.`,
                loc: raw.loc,
            });
            return;
    }
}

export function validateInput(entries: RawEntry[], manifest: ManifestShape): BuildError[] {
    const errors: BuildError[] = [];
    for (const entry of entries) {
        if (entry.error) {
            errors.push({
                code: entry.error,
                message:
                    entry.error === 'spread'
                        ? 'Spread elements are not supported in $style().'
                        : 'Computed keys are not supported in $style().',
                loc: entry.loc,
            });
            continue;
        }
        if (entry.conditions) {
            for (const cond of entry.conditions) {
                const c = classifyCondition(cond.conditionKey);
                if ('error' in c) {
                    errors.push({
                        code: 'invalid-input-shape',
                        message: `Unknown condition "${cond.conditionKey}".`,
                        loc: cond.loc,
                    });
                    continue;
                }
                validateValue(entry.property, cond.value, manifest, errors, false);
            }
            continue;
        }
        if (entry.value) {
            validateValue(entry.property, entry.value, manifest, errors, true);
        }
    }
    return errors;
}
