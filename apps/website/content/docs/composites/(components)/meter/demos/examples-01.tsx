import { Meter } from '@vapor-ui/composites';

export default function Demo() {
    return (
        <Meter
            type="default"
            label="저장 공간"
            value={6}
            max={20}
            valueText={(value) => `${value}GB`}
            maxValueText={(max) => `${max}GB`}
        />
    );
}
