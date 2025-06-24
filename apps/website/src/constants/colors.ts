import basicColorData from '../../public/tokens/color/basic-color.json';
import semanticColorData from '../../public/tokens/color/semantic-color.json';

// JSON 데이터를 기반으로 한 새로운 상수들

export const BasicColorData = Object.keys(basicColorData).map((key) => {
    const colorValue = basicColorData[key as keyof typeof basicColorData];

    return {
        title: key,
        colorShade:
            typeof colorValue === 'object'
                ? Object.keys(colorValue).map((shade) => ({
                      name: `${key}-${shade}`,
                      value: colorValue[shade as keyof typeof colorValue],
                  }))
                : [
                      {
                          name: key,
                          value: colorValue,
                      },
                  ],
    };
});

export const SemanticColorData = Object.keys(semanticColorData).map((key) => {
    const colorValue = semanticColorData[key as keyof typeof semanticColorData];

    return {
        title: key,
        colorShade: Object.keys(colorValue).map((shade) => ({
            name: `${key}-${shade}`,
            value: colorValue[shade as keyof typeof colorValue],
        })),
    };
});

// JSON 데이터 자체도 export
export { basicColorData, semanticColorData };
