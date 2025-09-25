import basicColorData from '../../public/tokens/color/basic-color.json';
import semanticColorData from '../../public/tokens/color/semantic-color.json';

// 타입 정의
export type BasicColor = string | Record<string, string>;
export type BasicColorDataType = Record<string, BasicColor>;

export type SemanticColorValue = {
    value: string;
    basicToken?: string;
};

export type SemanticColorVariant = {
    '100'?: SemanticColorValue;
    '200'?: SemanticColorValue;
};

export type SemanticColorItem = SemanticColorValue | SemanticColorVariant | Record<string, unknown>;
export type SemanticColorGroup = Record<string, SemanticColorItem>;
export type SemanticColorDataType = Record<string, SemanticColorGroup>;

// JSON 데이터를 기반으로 한 새로운 상수들

export const BasicColorData = Object.keys(basicColorData as BasicColorDataType).map((key) => {
    const colorValue = (basicColorData as BasicColorDataType)[key];

    return {
        title: key,
        colorShade:
            typeof colorValue === 'object'
                ? Object.keys(colorValue).map((shade) => ({
                      name: `--vapor-color-${key}-${shade}`,
                      value: (colorValue as Record<string, string>)[shade],
                  }))
                : [
                      {
                          name: `--vapor-color-${key}`,
                          value: colorValue as string,
                      },
                  ],
    };
});

const processSemanticColorItem = (
    key: string,
    shade: string,
    item: SemanticColorItem,
): Array<{ name: string; value: string; basicToken?: string }> => {
    // Check if it has value property (leaf node)
    if (item && typeof item === 'object' && 'value' in item) {
        return [
            {
                name: `--vapor-color-${key}-${shade}`,
                value: item.value,
                basicToken: item.basicToken,
            },
        ];
    }

    // Check if it's a variant object (has 100/200 properties)
    if (item && typeof item === 'object' && ('100' in item || '200' in item)) {
        const variant = item as SemanticColorVariant;
        return Object.keys(variant).map((variantKey) => {
            const variantItem = variant[variantKey as '100' | '200'];
            return {
                name: `--vapor-color-${key}-${shade}-${variantKey}`,
                value: variantItem!.value,
                basicToken: variantItem!.basicToken,
            };
        });
    }

    // Handle deeper nested structures (like button.foreground.primary)
    if (item && typeof item === 'object') {
        return Object.keys(item).flatMap((nestedKey) => {
            const nestedItem = item[nestedKey];
            return processSemanticColorItem(key, `${shade}-${nestedKey}`, nestedItem);
        });
    }

    return [];
};

export const SemanticColorData = Object.keys(semanticColorData as SemanticColorDataType).map(
    (key) => {
        const colorValue = (semanticColorData as SemanticColorDataType)[key];

        return {
            title: key,
            colorShade: Object.keys(colorValue).flatMap((shade) => {
                const item = colorValue[shade];
                return processSemanticColorItem(key, shade, item);
            }),
        };
    },
);

// JSON 데이터 자체도 export
export { basicColorData, semanticColorData };
