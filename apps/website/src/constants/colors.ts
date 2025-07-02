import basicColorData from '../../public/tokens/color/basic-color.json';
import semanticColorData from '../../public/tokens/color/semantic-color.json';

// 타입 정의
export type BasicColor = string | Record<string, string>;
export type BasicColorDataType = Record<string, BasicColor>;

export type SemanticColorValue = {
    value: string;
    basicToken: string;
};
export type SemanticColorGroup = Record<string, SemanticColorValue>;
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

export const SemanticColorData = Object.keys(semanticColorData as SemanticColorDataType).map(
    (key) => {
        const colorValue = (semanticColorData as SemanticColorDataType)[key];

        return {
            title: key,
            colorShade: Object.keys(colorValue).map((shade) => ({
                name: `--vapor-color-${key}-${shade}`,
                value: colorValue[shade].value,
                basicToken: colorValue[shade].basicToken,
            })),
        };
    },
);

// JSON 데이터 자체도 export
export { basicColorData, semanticColorData };
