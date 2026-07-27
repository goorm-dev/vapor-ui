import { tokenField } from '../engine/factories';
import { notRoot, notVectorLike, sizingFixed } from '../engine/guards';

// 벡터 원시 노드 크기는 도형 자체 속성, root 프레임은 뷰포트라 검사 제외.
// FIXED sizing 만 토큰 검사 대상 (HUG/FILL 은 파생값).
export const widthRule = tokenField({
    name: 'dimension:width',
    category: 'dimensions',
    property: 'width',
    field: 'width',
    guards: [notVectorLike, notRoot, sizingFixed('layoutSizingHorizontal')],
});

export const heightRule = tokenField({
    name: 'dimension:height',
    category: 'dimensions',
    property: 'height',
    field: 'height',
    guards: [notVectorLike, notRoot, sizingFixed('layoutSizingVertical')],
});
