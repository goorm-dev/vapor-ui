import basicColorData from '../../public/tokens/color/basic-color.json';
import semanticColorData from '../../public/tokens/color/semantic-color.json';

// JSON 데이터를 기반으로 한 새로운 상수들

const prefix = '--vapor-color';

export const BasicColorData = Object.keys(basicColorData).map((key) => {
    const colorValue = basicColorData[key as keyof typeof basicColorData];
    const isBaseColor = key === 'black' || key === 'white';

    return {
        title: isBaseColor ? 'base' : key,
        colorShade: isBaseColor
            ? [
                  {
                      name: `${prefix}-${key}`,
                      value: colorValue as string,
                  },
              ]
            : Object.keys(colorValue).map((shade) => ({
                  name: `${prefix}-${key}-${shade}`,
                  value: colorValue[shade as keyof typeof colorValue],
              })),
    };
});

type SemanticDataType = typeof semanticColorData;
type CategoryType = keyof SemanticDataType;
export interface FormattedColorGroup {
    title: CategoryType;
    colorShade: {
        name: string;
        value: string;
        basicToken: string;
    }[];
}

export const SemanticColorData: FormattedColorGroup[] = (
    Object.keys(semanticColorData) as CategoryType[]
).map((category) => {
    const innerColorObject = semanticColorData[category];
    type InnerColorName = keyof typeof innerColorObject;

    const colorShade = (Object.keys(innerColorObject) as InnerColorName[]).map((name) => {
        const colorInfo = innerColorObject[name];
        return {
            name: `${prefix}-${category}-${String(name)}`,
            value: colorInfo.value,
            basicToken: colorInfo.basicToken,
        };
    });

    return {
        title: category,
        colorShade: colorShade,
    };
});

// JSON 데이터 자체도 export
export { basicColorData, semanticColorData };
