import type { ComponentModel } from '~/models/component';
import type { PropertyJson, PropsInfoJson } from '~/models/json';
import type { ParsedComponent, ParsedProp } from '~/models/parsed';
import type { PropModel } from '~/models/prop';
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

export function propModelToJson(model: PropModel): PropertyJson {
    return {
        name: model.name,
        type: model.types,
        required: model.required,
        ...(model.description !== undefined && { description: model.description }),
        ...(model.defaultValue !== undefined && { defaultValue: model.defaultValue }),
    };
}

export function componentModelToJson(model: ComponentModel): PropsInfoJson {
    return {
        name: model.name,
        displayName: model.displayName,
        ...(model.description !== undefined && { description: model.description }),
        props: model.props.map(propModelToJson),
    };
}

export function componentsToJson(models: ComponentModel[]): PropsInfoJson[] {
    return models.map(componentModelToJson);
}
