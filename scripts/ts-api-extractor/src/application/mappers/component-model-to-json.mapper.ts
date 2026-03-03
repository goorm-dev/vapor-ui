import type { PropertyJson, PropsInfoJson } from '~/application/dto/component-json';
import type { ComponentModel } from '~/domain/models/component';
import type { PropModel } from '~/domain/models/prop';

export function propModelToJson(model: PropModel): PropertyJson {
    return {
        name: model.name,
        type: model.types,
        required: model.required,
        ...(model.description && { description: model.description }),
        ...(model.defaultValue && { defaultValue: model.defaultValue }),
    };
}

export function componentModelToJson(model: ComponentModel): PropsInfoJson {
    return {
        name: model.name,
        displayName: model.displayName,
        ...(model.description && { description: model.description }),
        props: model.props.map(propModelToJson),
    };
}

export function componentsToJson(models: ComponentModel[]): PropsInfoJson[] {
    return models.map(componentModelToJson);
}
