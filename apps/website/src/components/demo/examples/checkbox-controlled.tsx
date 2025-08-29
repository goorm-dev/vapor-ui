import { useState } from 'react';

import { Checkbox } from '@vapor-ui/core';

export default function CheckboxControlled() {
    const [controlledValue, setControlledValue] = useState(false);

    return (
        <div className="space-y-6">
            {/* Controlled checkbox */}
            <div className="space-y-2">
                <h3 className="font-medium">Controlled Checkbox</h3>
                <Checkbox.Root checked={controlledValue} onCheckedChange={setControlledValue}>
                    <Checkbox.Control />
                    <Checkbox.Label>
                        제어 컴포넌트 (현재 상태: {controlledValue ? 'checked' : 'unchecked'})
                    </Checkbox.Label>
                </Checkbox.Root>
                <button
                    onClick={() => setControlledValue(!controlledValue)}
                    className="text-sm px-3 py-1 bg-gray-100 rounded"
                >
                    외부에서 토글
                </button>
            </div>

            {/* Uncontrolled checkbox */}
            <div className="space-y-2">
                <h3 className="font-medium">Uncontrolled Checkbox</h3>
                <Checkbox.Root defaultChecked>
                    <Checkbox.Control />
                    <Checkbox.Label>비제어 컴포넌트 (defaultChecked)</Checkbox.Label>
                </Checkbox.Root>
            </div>
        </div>
    );
}
