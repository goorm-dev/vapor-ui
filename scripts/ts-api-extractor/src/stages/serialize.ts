import type { PropertyJson, PropsInfoJson } from '~/models/output';
import type { ComponentModel, PropModel } from '~/models/pipeline';

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
        ...(model.description !== undefined && { description: model.description }),
        props: model.props.map(propModelToJson),
    };
}

export function componentsToJson(models: ComponentModel[]): PropsInfoJson[] {
    return models.map(componentModelToJson);
}
