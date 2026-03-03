import type { ComponentModel } from '~/domain/models/component';
import type { ParsedComponent, ParsedProp } from '~/domain/models/parsed';
import type { PropModel } from '~/domain/models/prop';
import { categorizeProp } from '~/domain/rules/categorize-prop';
import { normalizeTypeStrings } from '~/domain/rules/normalize-types';
import { sortProps } from '~/domain/rules/sort-props';

export function parsedPropToModel(parsedProp: ParsedProp): PropModel {
    const required = !parsedProp.isOptional;

    return {
        name: parsedProp.name,
        types: normalizeTypeStrings(parsedProp.typeString),
        required,
        description: parsedProp.description,
        defaultValue: parsedProp.defaultValue,
        category: categorizeProp(parsedProp.name, required, parsedProp.declarationFilePath),
    };
}

export function parsedComponentToModel(parsedComponent: ParsedComponent): ComponentModel {
    const propModels = parsedComponent.props.map(parsedPropToModel);

    return {
        name: parsedComponent.name,
        displayName: parsedComponent.name,
        description: parsedComponent.description,
        props: sortProps(propModels),
    };
}

export function parsedComponentsToModels(parsedComponents: ParsedComponent[]): ComponentModel[] {
    return parsedComponents.map(parsedComponentToModel);
}
