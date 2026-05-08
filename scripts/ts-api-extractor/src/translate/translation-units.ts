import type { PropsInfoJson } from '~/models/output';
import type { ComponentReport } from '~/translate/report';
import type { TranslationOutcome, TranslationUnit } from '~/translate/types';

export function getTranslationUnitKey(unit: TranslationUnit): string {
    return `${unit.componentIndex}:${unit.id}`;
}

export function collectTranslationUnits(props: PropsInfoJson[]): TranslationUnit[] {
    const units: TranslationUnit[] = [];

    for (let componentIndex = 0; componentIndex < props.length; componentIndex++) {
        const component = props[componentIndex];
        if (component.description) {
            units.push({
                id: 'component.description',
                kind: 'component.description',
                ownerName: component.name,
                source: component.description,
                componentIndex,
            });
        }

        for (let propIndex = 0; propIndex < component.props.length; propIndex++) {
            const prop = component.props[propIndex];
            if (prop.description) {
                units.push({
                    id: `props[${propIndex}].${prop.name}.description`,
                    kind: 'prop.description',
                    ownerName: prop.name,
                    source: prop.description,
                    componentIndex,
                    propIndex,
                });
            }
        }
    }

    return units;
}

export function applyTranslationOutcomes(
    props: PropsInfoJson[],
    units: TranslationUnit[],
    outcomes: Map<string, TranslationOutcome>,
): PropsInfoJson[] {
    const result: PropsInfoJson[] = props.map((component) => ({
        ...component,
        props: component.props.map((prop) => ({ ...prop })),
    }));

    for (const unit of units) {
        const translated =
            (outcomes.get(getTranslationUnitKey(unit)) ?? outcomes.get(unit.id))?.translated ??
            unit.source;
        if (unit.kind === 'component.description') {
            result[unit.componentIndex] = {
                ...result[unit.componentIndex],
                description: translated,
            };
            continue;
        }

        if (unit.propIndex === undefined) continue;
        const component = result[unit.componentIndex];
        const nextProps = [...component.props];
        nextProps[unit.propIndex] = {
            ...nextProps[unit.propIndex],
            description: translated,
        };
        result[unit.componentIndex] = { ...component, props: nextProps };
    }

    return result;
}

export function buildComponentReports(
    props: PropsInfoJson[],
    units: TranslationUnit[],
    outcomes: Map<string, TranslationOutcome>,
): ComponentReport[] {
    return props.map((component, componentIndex) => {
        const componentUnits = units.filter((unit) => unit.componentIndex === componentIndex);
        const componentOutcomes = componentUnits
            .map((unit) => outcomes.get(getTranslationUnitKey(unit)) ?? outcomes.get(unit.id))
            .filter((outcome): outcome is TranslationOutcome => outcome !== undefined);

        return {
            name: component.name,
            totalTexts: componentUnits.length,
            verified: componentOutcomes.filter((outcome) => outcome.assurance === 'verified')
                .length,
            unverified: componentOutcomes.filter((outcome) => outcome.assurance === 'unverified')
                .length,
            cached: componentOutcomes.filter((outcome) => outcome.reason === 'cache_hit').length,
            gateSkipped: componentOutcomes.filter(
                (outcome) => outcome.reason === 'quality_gate_disabled',
            ).length,
            unverifiedOutcomes: componentOutcomes.filter(
                (outcome) => outcome.assurance === 'unverified' && outcome.reportable,
            ),
        };
    });
}
