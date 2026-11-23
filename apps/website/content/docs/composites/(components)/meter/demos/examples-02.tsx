import { Meter } from '@vapor-ui/composites';

export default function Demo() {
    return (
        <Meter
            type="warning"
            label="저장 공간 부족"
            value={18.7}
            max={20}
            valueText={(value) => `${value}GB`}
            maxValueText={(max) => `${max}GB`}
        />
    );
}
