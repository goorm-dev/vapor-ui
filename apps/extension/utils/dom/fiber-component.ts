interface ComponentType {
    displayName?: string;
    name?: string;
    type?: FiberType;
    render?: FiberType;
}

type FiberType = string | ComponentType | null | undefined;

interface Fiber {
    type: FiberType;
    return: Fiber | null;
}

const getFiber = (node: Element): Fiber | null => {
    for (const key in node) {
        if (key.startsWith('__reactFiber')) {
            return (node as unknown as Record<string, Fiber>)[key] ?? null;
        }
    }
    return null;
};

// memo=.type, forwardRef=.render 재귀 unwrap
const getName = (type: FiberType): string | null => {
    if (type == null) return null;
    if (typeof type === 'string') return null;
    if (typeof type === 'function') {
        const fn = type as ComponentType;
        return fn.displayName || fn.name || null;
    }
    if (type.displayName) return type.displayName;
    return getName(type.type ?? type.render);
};

// DOM을 그리지 않는 구조용 래퍼 — 어느 라이브러리든 계보에 무의미해 제외(벤더 중립).
const isStructuralWrapper = (name: string): boolean =>
    name.endsWith('Context') || name.endsWith('Provider');

// 선택된 요소에서 fiber.return 체인을 거슬러 올라가며, 이름 있는 컴포넌트를
// 가까운 순 최대 3개 수집한다([0]=가장 안쪽). host·구조 래퍼·인접 중복은 건너뛴다.
export const extractComponentAncestry = (element: Element): string[] => {
    const names: string[] = [];
    let current = getFiber(element);

    while (current && names.length < 3) {
        const name = getName(current.type);
        if (
            name &&
            !isStructuralWrapper(name) &&
            names[names.length - 1] !== name // 인접 중복 접기
        ) {
            names.push(name);
        }
        current = current.return;
    }

    return names;
};
