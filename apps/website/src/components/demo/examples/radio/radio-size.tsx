import { Radio } from '@vapor-ui/core';

export default function RadioSize() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-3 text-gray-700">Medium (기본 크기)</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                    <Radio.Root size="md" value="md-1" />
                    Medium Size
                </label>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-3 text-gray-700">Large</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                    <Radio.Root size="lg" value="lg-1" />
                    Large Size
                </label>
            </div>
        </div>
    );
}
