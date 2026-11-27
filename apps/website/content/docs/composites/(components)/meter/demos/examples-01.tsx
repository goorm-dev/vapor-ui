import { Meter } from '@vapor-ui/composites';

export default function Demo() {
    return (
        <Meter
            value={6}
            max={20}
            size="md"
            type="default"
            label="저장 공간"
            description="14GB를 더 사용할 수 있습니다."
            valueText={(value) => `${value}GB`}
            maxValueText="20GB"
        />
    );
}
