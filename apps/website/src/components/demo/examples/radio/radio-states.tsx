import { Radio } from '@vapor-ui/core';

export default function RadioStates() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-3 text-gray-700">기본 상태</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                    <Radio.Root value="normal" />
                    정상 상태
                </label>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-3 text-gray-700">비활성화 상태</h4>
                <label className="flex items-center gap-2 opacity-50">
                    <Radio.Root value="disabled" disabled />
                    비활성화 상태
                </label>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-3 text-gray-700">오류 상태</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                    <Radio.Root value="invalid" invalid />
                    오류 상태
                </label>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-3 text-gray-700">읽기 전용 상태</h4>
                <label className="flex items-center gap-2">
                    <Radio.Root value="readonly" readOnly />
                    읽기 전용 상태
                </label>
            </div>
        </div>
    );
}
