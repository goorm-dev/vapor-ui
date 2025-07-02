import borderRadiusData from '../../public/tokens/size/border-radius.json';
import dimensionData from '../../public/tokens/size/dimension.json';
import spaceData from '../../public/tokens/size/space.json';
import { sortByNumericKey } from '../utils/object';

// JSON 데이터를 기반으로 한 새로운 상수들

export const BorderRadiusData = Object.keys(borderRadiusData['border-radius'])
    .map((key) => ({
        name: `--vapor-size-borderRadius-${key}`,
        value: borderRadiusData['border-radius'][
            key as keyof (typeof borderRadiusData)['border-radius']
        ],
    }))
    .sort(sortByNumericKey);

export const SpaceData = Object.keys(spaceData['space'])
    .map((key) => ({
        name: `--vapor-size-space-${key}`,
        value: spaceData['space'][key as keyof (typeof spaceData)['space']],
    }))
    .sort(sortByNumericKey);

export const DimensionData = Object.keys(dimensionData['dimension'])
    .map((key) => ({
        name: `--vapor-size-dimension-${key}`,
        value: dimensionData['dimension'][key as keyof (typeof dimensionData)['dimension']],
    }))
    .sort(sortByNumericKey);

// JSON 데이터 자체도 export
export { borderRadiusData, spaceData, dimensionData };
