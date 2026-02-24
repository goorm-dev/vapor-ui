/**
 * Model to JSON Serializer
 *
 * 도메인 모델을 JSON 스키마 형태로 변환합니다.
 * 내부 메타데이터(source, category)를 제거하고 외부 consumer용 형태로 변환합니다.
 */
import type { ComponentModel, PropModel } from '~/core/model/types';

import type { PropertyJson, PropsInfoJson } from './types';

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
