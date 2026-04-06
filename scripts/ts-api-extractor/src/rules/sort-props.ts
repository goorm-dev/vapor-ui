import type { PropModel } from '~/models/prop';
import { CATEGORY_ORDER } from '~/rules/categorize-prop';

export function sortProps(props: PropModel[]): PropModel[] {
    return [...props].sort((a, b) => {
        const categoryOrder = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
        if (categoryOrder !== 0) return categoryOrder;
        return a.name.localeCompare(b.name);
    });
}
