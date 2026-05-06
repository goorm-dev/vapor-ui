import type { ComponentModel, ParsedComponent, ParsedProp, PropModel } from '~/models/pipeline';
import { categorizeProp } from '~/rules/categorize-prop';
import { normalizeTypeStrings } from '~/rules/normalize-types';
import { sortProps } from '~/rules/sort-props';

export function parsedPropToModel(parsedProp: ParsedProp): PropModel {
    const required = !parsedProp.isOptional;

    return {
        name: parsedProp.name,
        types: normalizeTypeStrings(parsedProp.typeString),
        required,
        description: parsedProp.description,
        defaultValue: parsedProp.defaultValue,
        category: categorizeProp(parsedProp.name, required, parsedProp.source),
    };
}

export function parsedComponentToModel(parsedComponent: ParsedComponent): ComponentModel {
    const propModels = parsedComponent.props.map(parsedPropToModel);

    return {
        name: parsedComponent.name,
        description: parsedComponent.description,
        props: sortProps(propModels),
    };
}

export function parsedComponentsToModels(parsedComponents: ParsedComponent[]): ComponentModel[] {
    return parsedComponents.map(parsedComponentToModel);
}
