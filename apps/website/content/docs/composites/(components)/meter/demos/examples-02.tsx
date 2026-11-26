import { Meter } from '@vapor-ui/composites';

export default function Demo() {
    return (
        <Meter
            value={18.7}
            max={20}
            size="md"
            type="warning"
            label="저장 공간"
            description="1.3GB 남았습니다. 파일을 정리해 주세요."
            valueText={(value) => `${value}GB`}
            maxValueText="20GB"
        />
    );
}
